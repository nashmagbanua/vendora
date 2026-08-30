-- ==============================================================================
-- VENDORA E-COMMERCE ENGINE — MIGRATION 004
-- ORDER SECURITY HARDENING & TAMPER-PROOF GUEST CHECKOUT
-- ==============================================================================

-- 0. ENABLE PGCRYPTO FOR SECURE TOKEN GENERATION
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ADD TRACKING TOKEN COLUMN & MERCHANT STATUS FOR SECURE GUEST ORDER ACCESS
ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex');

CREATE INDEX IF NOT EXISTS idx_orders_tracking_token ON public.orders(tracking_token);

-- Safely backfill any existing orders missing a tracking_token
UPDATE public.orders
SET tracking_token = encode(gen_random_bytes(32), 'hex')
WHERE tracking_token IS NULL;

ALTER TABLE public.orders 
ALTER COLUMN tracking_token SET NOT NULL;

-- 2. ENFORCE COMPOSITE CROSS-MERCHANT INTEGRITY & UNIQUE CONSTRAINTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_orders_merchant_order_number'
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT uq_orders_merchant_order_number UNIQUE (merchant_id, order_number);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_orders_id_merchant'
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT uq_orders_id_merchant UNIQUE (id, merchant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_items_order_merchant'
  ) THEN
    ALTER TABLE public.order_items
    ADD CONSTRAINT fk_order_items_order_merchant
    FOREIGN KEY (order_id, merchant_id)
    REFERENCES public.orders(id, merchant_id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- 3. DROP INSECURE POLICIES FROM PREVIOUS MIGRATIONS
DROP POLICY IF EXISTS "Anyone can create order" ON public.orders;
DROP POLICY IF EXISTS "View order access" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "View order items" ON public.order_items;
DROP POLICY IF EXISTS "Merchant members and token holders can view orders" ON public.orders;
DROP POLICY IF EXISTS "Merchant members and token holders can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Merchant members can view orders" ON public.orders;
DROP POLICY IF EXISTS "Merchant members can view order items" ON public.order_items;

-- 4. IMPLEMENT STRICT RLS POLICIES FOR ORDERS
-- Only authenticated merchant team members can query orders directly.
-- Direct public/anon SELECT and INSERT are prohibited; guests interact exclusively via SECURITY DEFINER RPCs.
CREATE POLICY "Merchant members can view orders"
    ON public.orders FOR SELECT
    USING (public.is_merchant_member(merchant_id));

-- 5. IMPLEMENT STRICT RLS POLICIES FOR ORDER ITEMS
CREATE POLICY "Merchant members can view order items"
    ON public.order_items FOR SELECT
    USING (public.is_merchant_member(merchant_id));

-- 6. ATOMIC & SERVER-VALIDATED ORDER CREATION RPC (SECURITY DEFINER)
-- Validates merchant, active status, store open state, products, option groups, and options.
-- Calculates unit prices, option modifiers, delivery fee, subtotal, and total server-side exclusively.
CREATE OR REPLACE FUNCTION public.create_secure_order(
    p_merchant_id UUID,
    p_customer_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_fulfillment TEXT,
    p_address TEXT,
    p_payment_method TEXT,
    p_notes TEXT,
    p_items JSONB,
    p_order_number TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_merchant public.merchants%ROWTYPE;
    v_settings public.store_settings%ROWTYPE;
    v_customer_id UUID;
    v_order_id UUID;
    v_order_number TEXT;
    v_tracking_token TEXT;
    v_subtotal NUMERIC(10, 2) := 0.00;
    v_delivery_fee NUMERIC(10, 2) := 0.00;
    v_total NUMERIC(10, 2) := 0.00;
    v_item JSONB;
    v_product_id UUID;
    v_qty INT;
    v_product public.products%ROWTYPE;
    v_unit_price NUMERIC(10, 2);
    v_item_total NUMERIC(10, 2);
    v_opt_desc_parts TEXT[];
    v_options_desc TEXT;
    v_group_key TEXT;
    v_group_id UUID;
    v_opt_val JSONB;
    v_opt_id_text TEXT;
    v_opt_id UUID;
    v_opt_record RECORD;
    v_result JSONB;
    v_collision_retries INT := 0;
    v_inserted BOOLEAN := false;
BEGIN
    -- 1. Validate Merchant Existence & Active Status
    SELECT * INTO v_merchant FROM public.merchants WHERE id = p_merchant_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Merchant not found';
    END IF;

    IF NOT v_merchant.is_active THEN
        RAISE EXCEPTION 'Merchant is currently inactive';
    END IF;

    SELECT * INTO v_settings FROM public.store_settings WHERE merchant_id = p_merchant_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Store settings not found for this merchant';
    END IF;

    IF NOT v_settings.is_open THEN
        RAISE EXCEPTION 'Store is currently closed for orders';
    END IF;

    -- 2. Validate Customer Details
    IF p_customer_name IS NULL OR TRIM(p_customer_name) = '' THEN
        RAISE EXCEPTION 'Customer name is required';
    END IF;

    IF p_phone IS NULL OR TRIM(p_phone) = '' THEN
        RAISE EXCEPTION 'Phone number is required';
    END IF;

    IF p_fulfillment NOT IN ('delivery', 'pickup') THEN
        RAISE EXCEPTION 'Invalid fulfillment type: %', p_fulfillment;
    END IF;

    IF p_fulfillment = 'delivery' AND (p_address IS NULL OR TRIM(p_address) = '') THEN
        RAISE EXCEPTION 'Delivery address is required for delivery orders';
    END IF;

    IF p_payment_method NOT IN ('gcash', 'maya', 'cod') THEN
        RAISE EXCEPTION 'Invalid payment method: %', p_payment_method;
    END IF;

    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one item';
    END IF;

    -- 3. Atomically Upsert Customer Profile
    INSERT INTO public.customers (
        merchant_id,
        full_name,
        phone,
        email,
        address
    ) VALUES (
        p_merchant_id,
        TRIM(p_customer_name),
        TRIM(p_phone),
        NULLIF(TRIM(p_email), ''),
        CASE WHEN p_fulfillment = 'delivery' THEN TRIM(p_address) ELSE NULL END
    )
    ON CONFLICT (merchant_id, phone) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = COALESCE(EXCLUDED.email, customers.email),
        address = COALESCE(EXCLUDED.address, customers.address),
        updated_at = now()
    RETURNING id INTO v_customer_id;

    -- 4. Calculate Delivery Fee Server-Side Exclusively
    IF p_fulfillment = 'delivery' THEN
        v_delivery_fee := COALESCE(v_settings.delivery_fee, 0.00);
    ELSE
        v_delivery_fee := 0.00;
    END IF;

    -- 5. Generate Cryptographic Tracking Token & Collision-Safe Order Number
    v_tracking_token := encode(gen_random_bytes(32), 'hex');

    WHILE NOT v_inserted AND v_collision_retries < 5 LOOP
        BEGIN
            v_order_number := '#ORD-' || UPPER(SUBSTRING(encode(gen_random_bytes(3), 'hex') FROM 1 FOR 5));
            
            INSERT INTO public.orders (
                merchant_id,
                customer_id,
                order_number,
                customer_name,
                phone,
                email,
                fulfillment,
                address,
                payment_method,
                payment_status,
                notes,
                subtotal,
                delivery_fee,
                total,
                status,
                estimated_time,
                tracking_token
            ) VALUES (
                p_merchant_id,
                v_customer_id,
                v_order_number,
                TRIM(p_customer_name),
                TRIM(p_phone),
                NULLIF(TRIM(p_email), ''),
                p_fulfillment,
                CASE WHEN p_fulfillment = 'delivery' THEN TRIM(p_address) ELSE COALESCE(v_settings.address, 'Store Pickup') END,
                p_payment_method,
                'pending',
                NULLIF(TRIM(p_notes), ''),
                0.00,
                v_delivery_fee,
                0.00,
                'pending',
                CASE WHEN p_fulfillment = 'delivery' THEN '30-45 mins' ELSE '15-20 mins' END,
                v_tracking_token
            )
            RETURNING id INTO v_order_id;
            
            v_inserted := true;
        EXCEPTION
            WHEN unique_violation THEN
                v_collision_retries := v_collision_retries + 1;
                IF v_collision_retries >= 5 THEN
                    v_order_number := '#ORD-' || UPPER(SUBSTRING(encode(gen_random_bytes(6), 'hex') FROM 1 FOR 10));
                    INSERT INTO public.orders (
                        merchant_id,
                        customer_id,
                        order_number,
                        customer_name,
                        phone,
                        email,
                        fulfillment,
                        address,
                        payment_method,
                        payment_status,
                        notes,
                        subtotal,
                        delivery_fee,
                        total,
                        status,
                        estimated_time,
                        tracking_token
                    ) VALUES (
                        p_merchant_id,
                        v_customer_id,
                        v_order_number,
                        TRIM(p_customer_name),
                        TRIM(p_phone),
                        NULLIF(TRIM(p_email), ''),
                        p_fulfillment,
                        CASE WHEN p_fulfillment = 'delivery' THEN TRIM(p_address) ELSE COALESCE(v_settings.address, 'Store Pickup') END,
                        p_payment_method,
                        'pending',
                        NULLIF(TRIM(p_notes), ''),
                        0.00,
                        v_delivery_fee,
                        0.00,
                        'pending',
                        CASE WHEN p_fulfillment = 'delivery' THEN '30-45 mins' ELSE '15-20 mins' END,
                        v_tracking_token
                    )
                    RETURNING id INTO v_order_id;
                    v_inserted := true;
                END IF;
        END;
    END LOOP;

    -- 6. Validate Line Items, Options, and Compute Server-Side Prices
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        BEGIN
            v_product_id := (v_item->>'product_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            RAISE EXCEPTION 'Invalid product ID format in items payload';
        END;

        v_qty := COALESCE((v_item->>'quantity')::INT, 1);
        IF v_qty <= 0 OR v_qty > 100 THEN
            RAISE EXCEPTION 'Item quantity must be between 1 and 100';
        END IF;

        -- Verify product belongs to this merchant and is active
        SELECT * INTO v_product 
        FROM public.products 
        WHERE id = v_product_id AND merchant_id = p_merchant_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % does not exist or does not belong to merchant %', v_product_id, p_merchant_id;
        END IF;

        IF NOT v_product.is_active THEN
            RAISE EXCEPTION 'Product "%" is currently inactive', v_product.name;
        END IF;

        v_unit_price := v_product.base_price;
        v_opt_desc_parts := ARRAY[]::TEXT[];

        -- Validate Selected Options & Groups (Strict Verification)
        IF v_item ? 'selected_options' AND (v_item->'selected_options') IS NOT NULL AND jsonb_typeof(v_item->'selected_options') = 'object' THEN
            FOR v_group_key, v_opt_val IN SELECT * FROM jsonb_each(v_item->'selected_options')
            LOOP
                BEGIN
                    v_group_id := v_group_key::UUID;
                EXCEPTION WHEN OTHERS THEN
                    RAISE EXCEPTION 'Invalid option group ID format: %', v_group_key;
                END;

                -- Verify that the option group exists for this product and merchant
                IF NOT EXISTS (
                    SELECT 1 FROM public.product_option_groups 
                    WHERE id = v_group_id AND product_id = v_product.id AND merchant_id = p_merchant_id
                ) THEN
                    RAISE EXCEPTION 'Option group % does not belong to product %', v_group_id, v_product.name;
                END IF;

                IF jsonb_typeof(v_opt_val) = 'array' THEN
                    FOR v_opt_id_text IN SELECT jsonb_array_elements_text(v_opt_val)
                    LOOP
                        BEGIN
                            v_opt_id := v_opt_id_text::UUID;
                        EXCEPTION WHEN OTHERS THEN
                            RAISE EXCEPTION 'Invalid option ID format: %', v_opt_id_text;
                        END;

                        SELECT po.name, po.price_modifier INTO v_opt_record
                        FROM public.product_options po
                        JOIN public.product_option_groups pog ON pog.id = po.option_group_id
                        WHERE po.id = v_opt_id 
                          AND pog.id = v_group_id
                          AND pog.product_id = v_product.id 
                          AND pog.merchant_id = p_merchant_id;

                        IF NOT FOUND THEN
                            RAISE EXCEPTION 'Option % does not belong to option group % or product %', v_opt_id, v_group_id, v_product.name;
                        END IF;

                        v_unit_price := v_unit_price + COALESCE(v_opt_record.price_modifier, 0.00);
                        v_opt_desc_parts := array_append(v_opt_desc_parts, v_opt_record.name);
                    END LOOP;
                ELSIF jsonb_typeof(v_opt_val) = 'string' AND (v_opt_val#>>'{}') <> '' THEN
                    BEGIN
                        v_opt_id := (v_opt_val#>>'{}')::UUID;
                    EXCEPTION WHEN OTHERS THEN
                        RAISE EXCEPTION 'Invalid option ID format: %', (v_opt_val#>>'{}');
                    END;

                    SELECT po.name, po.price_modifier INTO v_opt_record
                    FROM public.product_options po
                    JOIN public.product_option_groups pog ON pog.id = po.option_group_id
                    WHERE po.id = v_opt_id 
                      AND pog.id = v_group_id
                      AND pog.product_id = v_product.id 
                      AND pog.merchant_id = p_merchant_id;

                    IF NOT FOUND THEN
                        RAISE EXCEPTION 'Option % does not belong to option group % or product %', v_opt_id, v_group_id, v_product.name;
                    END IF;

                    v_unit_price := v_unit_price + COALESCE(v_opt_record.price_modifier, 0.00);
                    v_opt_desc_parts := array_append(v_opt_desc_parts, v_opt_record.name);
                END IF;
            END LOOP;
        END IF;

        v_options_desc := CASE 
            WHEN array_length(v_opt_desc_parts, 1) > 0 THEN array_to_string(v_opt_desc_parts, ', ')
            ELSE COALESCE(v_item->>'options_description', 'Standard')
        END;

        v_item_total := v_unit_price * v_qty;
        v_subtotal := v_subtotal + v_item_total;

        -- Insert Immutable Line Item Snapshot with Strict Composite FK
        INSERT INTO public.order_items (
            merchant_id,
            order_id,
            product_id,
            product_name,
            options_description,
            selected_options,
            quantity,
            unit_price,
            total_price
        ) VALUES (
            p_merchant_id,
            v_order_id,
            v_product.id,
            v_product.name,
            v_options_desc,
            COALESCE(v_item->'selected_options', '{}'::jsonb),
            v_qty,
            v_unit_price,
            v_item_total
        );
    END LOOP;

    -- 7. Calculate Final Total & Update Order
    v_total := v_subtotal + v_delivery_fee;

    UPDATE public.orders
    SET subtotal = v_subtotal,
        delivery_fee = v_delivery_fee,
        total = v_total
    WHERE id = v_order_id;

    -- 8. Return Full Verified Order Snapshot
    SELECT jsonb_build_object(
        'id', o.id,
        'merchantId', o.merchant_id,
        'orderNumber', o.order_number,
        'customerName', o.customer_name,
        'phone', o.phone,
        'email', o.email,
        'fulfillment', o.fulfillment,
        'address', o.address,
        'paymentMethod', o.payment_method,
        'paymentStatus', o.payment_status,
        'notes', o.notes,
        'subtotal', o.subtotal,
        'deliveryFee', o.delivery_fee,
        'total', o.total,
        'status', o.status,
        'estimatedTime', o.estimated_time,
        'trackingToken', o.tracking_token,
        'createdAt', o.created_at,
        'items', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'productId', oi.product_id,
                    'title', oi.product_name,
                    'optionsDescription', oi.options_description,
                    'quantity', oi.quantity,
                    'unitPrice', oi.unit_price,
                    'totalPrice', oi.total_price
                )
            )
            FROM public.order_items oi
            WHERE oi.order_id = o.id AND oi.merchant_id = o.merchant_id
        ), '[]'::jsonb)
    ) INTO v_result
    FROM public.orders o
    WHERE o.id = v_order_id;

    RETURN v_result;
END;
$$;

-- 7. RPC TO SECURELY FETCH GUEST ORDER BY TRACKING TOKEN
CREATE OR REPLACE FUNCTION public.get_order_by_tracking_token(
    p_order_id UUID,
    p_tracking_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_result JSONB;
BEGIN
    IF p_order_id IS NULL OR p_tracking_token IS NULL OR TRIM(p_tracking_token) = '' THEN
        RETURN NULL;
    END IF;

    SELECT jsonb_build_object(
        'id', o.id,
        'merchantId', o.merchant_id,
        'orderNumber', o.order_number,
        'customerName', o.customer_name,
        'phone', o.phone,
        'email', o.email,
        'fulfillment', o.fulfillment,
        'address', o.address,
        'paymentMethod', o.payment_method,
        'paymentStatus', o.payment_status,
        'notes', o.notes,
        'subtotal', o.subtotal,
        'deliveryFee', o.delivery_fee,
        'total', o.total,
        'status', o.status,
        'estimatedTime', o.estimated_time,
        'trackingToken', o.tracking_token,
        'createdAt', o.created_at,
        'items', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'productId', oi.product_id,
                    'title', oi.product_name,
                    'optionsDescription', oi.options_description,
                    'quantity', oi.quantity,
                    'unitPrice', oi.unit_price,
                    'totalPrice', oi.total_price
                )
            )
            FROM public.order_items oi
            WHERE oi.order_id = o.id AND oi.merchant_id = o.merchant_id
        ), '[]'::jsonb)
    ) INTO v_result
    FROM public.orders o
    WHERE o.id = p_order_id AND o.tracking_token = TRIM(p_tracking_token);

    RETURN v_result;
END;
$$;

-- 8. EXPLICIT RPC PRIVILEGE MANAGEMENT
REVOKE ALL ON FUNCTION public.create_secure_order(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_secure_order(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_order_by_tracking_token(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_by_tracking_token(UUID, TEXT) TO anon, authenticated, service_role;

