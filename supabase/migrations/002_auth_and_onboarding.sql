-- ==============================================================================
-- VENDORA E-COMMERCE ENGINE — MIGRATION 002
-- AUTHENTICATION, USER PROFILES & ATOMIC MERCHANT ONBOARDING
-- ==============================================================================

-- 1. Automatically create profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName', split_part(NEW.email, '@', 1)),
    'owner'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$;

-- Register trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Allow users to insert/upsert their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 3. Atomic Merchant Onboarding Function
-- Creates merchant, owner membership, default store settings, and starter category for authenticated user
CREATE OR REPLACE FUNCTION public.create_merchant_with_owner(
  p_name TEXT,
  p_slug TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_currency TEXT DEFAULT '₱',
  p_delivery_fee NUMERIC DEFAULT 50.00,
  p_phone TEXT DEFAULT '+63 900 000 0000',
  p_address TEXT DEFAULT 'Metro Manila, Philippines'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_merchant_id UUID;
  v_slug TEXT;
  v_result JSONB;
BEGIN
  -- Authenticate caller
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create a merchant.';
  END IF;

  -- Ensure store name is valid
  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'Store name is required.';
  END IF;

  -- Generate slug if not provided
  IF p_slug IS NULL OR length(trim(p_slug)) = 0 THEN
    v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(v_user_id::text from 1 for 6);
  ELSE
    v_slug := p_slug;
  END IF;

  -- Ensure user profile exists
  INSERT INTO public.profiles (id, email, full_name, role)
  SELECT v_user_id, auth.jwt()->>'email', COALESCE(auth.jwt()->'user_metadata'->>'full_name', 'Merchant Owner'), 'owner'
  ON CONFLICT (id) DO NOTHING;

  -- Create merchant record
  INSERT INTO public.merchants (name, slug, description, owner_id)
  VALUES (p_name, v_slug, p_description, v_user_id)
  RETURNING id INTO v_merchant_id;

  -- Assign owner membership
  INSERT INTO public.merchant_members (merchant_id, user_id, role)
  VALUES (v_merchant_id, v_user_id, 'owner');

  -- Create initial store settings
  INSERT INTO public.store_settings (
    merchant_id,
    store_name,
    store_description,
    is_open,
    phone,
    address,
    delivery_fee,
    currency,
    plan,
    trial_days_left
  )
  VALUES (
    v_merchant_id,
    p_name,
    COALESCE(p_description, 'Welcome to ' || p_name || '! Fast & convenient ordering.'),
    true,
    p_phone,
    p_address,
    p_delivery_fee,
    p_currency,
    'Starter Plan',
    14
  );

  -- Seed initial starter category
  INSERT INTO public.categories (merchant_id, name, display_order)
  VALUES (v_merchant_id, 'Main Menu', 0);

  SELECT jsonb_build_object(
    'merchant_id', v_merchant_id,
    'name', p_name,
    'slug', v_slug,
    'role', 'owner'
  ) INTO v_result;

  RETURN v_result;
END;
$$;
