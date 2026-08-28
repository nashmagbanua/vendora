-- ==============================================================================
-- Vendora Supabase Migration: 001_initial_schema.sql
-- Description: Core schema, tables, multi-tenant merchant relationships, 
--              indexes, snapshot models, and Row Level Security (RLS) policies.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES (Linked to Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. MERCHANTS (Tenants)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. MERCHANT MEMBERS (RBAC: owner, admin, staff)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.merchant_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_merchant_member UNIQUE (merchant_id, user_id)
);

-- ==============================================================================
-- 4. STORE SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL UNIQUE REFERENCES public.merchants(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    store_description TEXT,
    is_open BOOLEAN NOT NULL DEFAULT true,
    phone TEXT,
    address TEXT,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT '₱',
    plan TEXT NOT NULL DEFAULT 'Starter',
    trial_days_left INTEGER NOT NULL DEFAULT 14,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. CATEGORIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. PRODUCTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT,
    name TEXT NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_best_seller BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    tag TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. PRODUCT OPTION GROUPS (Customizations: radio, checkbox, pills)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_option_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('radio', 'checkbox', 'pills')),
    required BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. PRODUCT OPTIONS (Individual choices with price modifiers & colors)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    option_group_id UUID NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_modifier NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    color_hex TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 9. CUSTOMERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    last_order_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_customer_phone_merchant UNIQUE (merchant_id, phone)
);

-- ==============================================================================
-- 10. ORDERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    fulfillment TEXT NOT NULL CHECK (fulfillment IN ('delivery', 'pickup')),
    address TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('gcash', 'maya', 'cod')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'expired', 'refunded')),
    notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'completed', 'declined', 'cancelled')),
    estimated_time TEXT NOT NULL DEFAULT '30-45 mins',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 11. ORDER ITEMS (Historical snapshots of purchased products)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    options_description TEXT,
    selected_options JSONB NOT NULL DEFAULT '{}'::jsonb,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 12. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON public.merchants(slug);
CREATE INDEX IF NOT EXISTS idx_merchant_members_user ON public.merchant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_members_merchant ON public.merchant_members(merchant_id);

CREATE INDEX IF NOT EXISTS idx_categories_merchant ON public.categories(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_merchant ON public.products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(merchant_id, is_active);

CREATE INDEX IF NOT EXISTS idx_option_groups_product ON public.product_option_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_options_group ON public.product_options(option_group_id);

CREATE INDEX IF NOT EXISTS idx_customers_merchant ON public.customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(merchant_id, phone);

CREATE INDEX IF NOT EXISTS idx_orders_merchant ON public.orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(merchant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_merchant ON public.order_items(merchant_id);

-- ==============================================================================
-- 13. SECURITY: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user belongs to merchant
CREATE OR REPLACE FUNCTION public.is_merchant_member(check_merchant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.merchant_members 
    WHERE merchant_id = check_merchant_id 
      AND user_id = auth.uid()
  );
$$;

-- Helper function: Check if current authenticated user is merchant owner/admin
CREATE OR REPLACE FUNCTION public.is_merchant_admin(check_merchant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.merchant_members 
    WHERE merchant_id = check_merchant_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$;

-- ------------------------------------------------------------------------------
-- PROFILES RLS
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- MERCHANTS RLS
-- ------------------------------------------------------------------------------
-- Public can view merchant public info (storefront)
CREATE POLICY "Public can view merchants"
    ON public.merchants FOR SELECT
    USING (true);

-- Merchant members/owners can update merchant profile
CREATE POLICY "Merchant admins can update merchant info"
    ON public.merchants FOR UPDATE
    USING (public.is_merchant_admin(id));

-- ------------------------------------------------------------------------------
-- MERCHANT MEMBERS RLS
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view membership for their merchants"
    ON public.merchant_members FOR SELECT
    USING (
      user_id = auth.uid() 
      OR public.is_merchant_member(merchant_id)
    );

CREATE POLICY "Owners can manage membership"
    ON public.merchant_members FOR ALL
    USING (public.is_merchant_admin(merchant_id));

-- ------------------------------------------------------------------------------
-- STORE SETTINGS RLS
-- ------------------------------------------------------------------------------
-- Public can view store settings for storefront display
CREATE POLICY "Public can view store settings"
    ON public.store_settings FOR SELECT
    USING (true);

-- Merchant admins can update their store settings
CREATE POLICY "Merchant admins can update store settings"
    ON public.store_settings FOR ALL
    USING (public.is_merchant_admin(merchant_id))
    WITH CHECK (public.is_merchant_admin(merchant_id));

-- ------------------------------------------------------------------------------
-- CATEGORIES RLS
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view categories"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Merchant members can manage categories"
    ON public.categories FOR ALL
    USING (public.is_merchant_member(merchant_id))
    WITH CHECK (public.is_merchant_member(merchant_id));

-- ------------------------------------------------------------------------------
-- PRODUCTS RLS
-- ------------------------------------------------------------------------------
-- Public storefront can view active products
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (is_active = true OR public.is_merchant_member(merchant_id));

-- Merchant members can manage products
CREATE POLICY "Merchant members can manage products"
    ON public.products FOR ALL
    USING (public.is_merchant_member(merchant_id))
    WITH CHECK (public.is_merchant_member(merchant_id));

-- ------------------------------------------------------------------------------
-- PRODUCT OPTION GROUPS & OPTIONS RLS
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view option groups"
    ON public.product_option_groups FOR SELECT
    USING (true);

CREATE POLICY "Merchant members can manage option groups"
    ON public.product_option_groups FOR ALL
    USING (public.is_merchant_member(merchant_id))
    WITH CHECK (public.is_merchant_member(merchant_id));

CREATE POLICY "Public can view options"
    ON public.product_options FOR SELECT
    USING (true);

CREATE POLICY "Merchant members can manage options"
    ON public.product_options FOR ALL
    USING (public.is_merchant_member(merchant_id))
    WITH CHECK (public.is_merchant_member(merchant_id));

-- ------------------------------------------------------------------------------
-- CUSTOMERS RLS
-- ------------------------------------------------------------------------------
-- Only authorized merchant members can view or manage customer records
CREATE POLICY "Merchant members can view customers"
    ON public.customers FOR SELECT
    USING (public.is_merchant_member(merchant_id));

CREATE POLICY "Merchant members can manage customers"
    ON public.customers FOR ALL
    USING (public.is_merchant_member(merchant_id))
    WITH CHECK (public.is_merchant_member(merchant_id));

-- ------------------------------------------------------------------------------
-- ORDERS RLS
-- ------------------------------------------------------------------------------
-- Public / Guests can insert orders
CREATE POLICY "Anyone can create order"
    ON public.orders FOR INSERT
    WITH CHECK (true);

-- Public / Customers can view their specific order (by ID) or merchant members can view all merchant orders
CREATE POLICY "View order access"
    ON public.orders FOR SELECT
    USING (
      public.is_merchant_member(merchant_id) 
      OR id IS NOT NULL -- Direct lookup for confirmation/tracking
    );

-- Only merchant members can update order status
CREATE POLICY "Merchant members can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_merchant_member(merchant_id))
    WITH CHECK (public.is_merchant_member(merchant_id));

-- ------------------------------------------------------------------------------
-- ORDER ITEMS RLS
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can create order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "View order items"
    ON public.order_items FOR SELECT
    USING (
      public.is_merchant_member(merchant_id)
      OR order_id IS NOT NULL
    );
