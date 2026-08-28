import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  User,
  Profile,
  Merchant,
  MerchantMember,
  MerchantSignUpData,
  MerchantCreateStoreData,
  MerchantLoginCredentials,
  AuthState
} from '../types';
import { INITIAL_MERCHANT, DEFAULT_MERCHANT_ID } from '../data/initialData';
import { DbMerchant, mapDbMerchantToMerchant } from '../lib/dbMappers';

const DEMO_USER: User = {
  id: 'demo-user-juan',
  email: 'juan@juanskitchen.ph',
  fullName: 'Juan Dela Cruz',
  role: 'owner',
  createdAt: new Date().toISOString()
};

const DEMO_PROFILE: Profile = {
  id: 'demo-user-juan',
  email: 'juan@juanskitchen.ph',
  fullName: 'Juan Dela Cruz',
  role: 'owner',
  createdAt: new Date().toISOString()
};

const DEMO_MEMBERSHIP: MerchantMember = {
  id: 'mem-demo-1',
  merchantId: DEFAULT_MERCHANT_ID,
  userId: 'demo-user-juan',
  role: 'owner',
  joinedAt: new Date().toISOString()
};

export const authService = {
  /**
   * Check if Supabase client is connected and active
   */
  isConfigured(): boolean {
    return isSupabaseConfigured && supabase !== null;
  },

  /**
   * Get current Supabase Auth session & resolve full merchant identity
   */
  async getInitialAuthState(): Promise<AuthState> {
    if (this.isConfigured() && supabase) {
      try {
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();

        if (sessionErr) {
          console.warn('[authService] Error fetching session:', sessionErr.message);
        }

        if (session && session.user) {
          const resolved = await this.resolveUserData(session.user.id, session.user.email || '');
          return {
            ...resolved,
            isLoading: false,
            isDemoMode: false,
            error: null
          };
        }
      } catch (err: any) {
        console.warn('[authService] Failed to restore session from Supabase:', err);
      }

      // No active session in configured Supabase
      return {
        user: null,
        profile: null,
        merchant: null,
        role: null,
        memberships: [],
        isAuthenticated: false,
        isLoading: false,
        isDemoMode: false,
        error: null
      };
    }

    // Supabase not configured -> default to demo session for instant usability
    return {
      user: DEMO_USER,
      profile: DEMO_PROFILE,
      merchant: INITIAL_MERCHANT,
      role: 'owner',
      memberships: [DEMO_MEMBERSHIP],
      isAuthenticated: true,
      isLoading: false,
      isDemoMode: true,
      error: null
    };
  },

  /**
   * Resolve user profile, memberships, and active merchant from database
   */
  async resolveUserData(userId: string, email: string): Promise<Omit<AuthState, 'isLoading' | 'isDemoMode' | 'error'>> {
    if (!this.isConfigured() || !supabase) {
      return {
        user: DEMO_USER,
        profile: DEMO_PROFILE,
        merchant: INITIAL_MERCHANT,
        role: 'owner',
        memberships: [DEMO_MEMBERSHIP],
        isAuthenticated: true
      };
    }

    try {
      // 1. Fetch Profile
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const profile: Profile = dbProfile ? {
        id: dbProfile.id,
        email: dbProfile.email || email,
        fullName: dbProfile.full_name || '',
        phone: dbProfile.phone || '',
        role: dbProfile.role || 'owner',
        avatarUrl: dbProfile.avatar_url || '',
        createdAt: dbProfile.created_at
      } : {
        id: userId,
        email,
        fullName: email.split('@')[0],
        role: 'owner'
      };

      const user: User = {
        id: userId,
        email: profile.email || email,
        fullName: profile.fullName,
        role: profile.role,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt
      };

      // 2. Fetch Merchant Memberships
      const { data: dbMemberships, error: memErr } = await supabase
        .from('merchant_members')
        .select('*')
        .eq('user_id', userId);

      if (memErr) {
        console.warn('[authService] Error fetching merchant memberships:', memErr.message);
      }

      const memberships: MerchantMember[] = (dbMemberships || []).map((m: any) => ({
        id: m.id,
        merchantId: m.merchant_id,
        userId: m.user_id,
        role: m.role as 'owner' | 'admin' | 'staff',
        joinedAt: m.joined_at
      }));

      // 3. If member of at least one merchant, fetch the primary merchant
      let merchant: Merchant | null = null;
      let role: 'owner' | 'admin' | 'staff' | null = null;

      if (memberships.length > 0) {
        const primaryMembership = memberships[0];
        role = primaryMembership.role;

        const { data: dbMerchant, error: mErr } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', primaryMembership.merchantId)
          .single();

        if (!mErr && dbMerchant) {
          merchant = mapDbMerchantToMerchant(dbMerchant as DbMerchant);
        }
      }

      return {
        user,
        profile,
        merchant,
        role,
        memberships,
        isAuthenticated: true
      };
    } catch (err) {
      console.error('[authService] resolveUserData failed:', err);
      throw err;
    }
  },

  /**
   * Merchant Sign Up flow
   * Creates Supabase Auth user and atomic merchant with owner role
   */
  async signUp(data: MerchantSignUpData): Promise<AuthState> {
    if (!this.isConfigured() || !supabase) {
      // Local/Demo Mode Signup
      const localUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        fullName: data.fullName,
        role: 'owner',
        createdAt: new Date().toISOString()
      };
      const localMerchant: Merchant = {
        id: `merchant-${Date.now()}`,
        name: data.storeName,
        slug: data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ownerId: localUser.id,
        createdAt: new Date().toISOString()
      };
      const localMembership: MerchantMember = {
        id: `mem-${Date.now()}`,
        merchantId: localMerchant.id,
        userId: localUser.id,
        role: 'owner',
        joinedAt: new Date().toISOString()
      };

      return {
        user: localUser,
        profile: { ...localUser },
        merchant: localMerchant,
        role: 'owner',
        memberships: [localMembership],
        isAuthenticated: true,
        isLoading: false,
        isDemoMode: true,
        error: null
      };
    }

    // 1. Create Auth User in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          store_name: data.storeName
        }
      }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    const createdUser = authData.user;
    if (!createdUser) {
      throw new Error('Sign up failed: User account could not be created.');
    }

    // 2. Call RPC to atomically create Merchant, Membership & Settings
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('create_merchant_with_owner', {
        p_name: data.storeName,
        p_slug: data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + createdUser.id.substring(0, 6),
        p_description: `Welcome to ${data.storeName}! Enjoy our best offerings.`,
        p_currency: '₱',
        p_delivery_fee: 50,
        p_phone: data.phone || '+63 900 000 0000',
        p_address: data.address || 'Metro Manila, Philippines'
      });

      if (rpcError) {
        console.warn('[authService] RPC onboarding error, attempting fallback insertion:', rpcError.message);
        // Fallback: Direct table inserts in case migration 002 RPC isn't loaded in DB yet
        const { data: insMerchant, error: mErr } = await supabase
          .from('merchants')
          .insert({
            name: data.storeName,
            slug: data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + createdUser.id.substring(0, 6),
            owner_id: createdUser.id
          })
          .select()
          .single();

        if (!mErr && insMerchant) {
          await supabase.from('merchant_members').insert({
            merchant_id: insMerchant.id,
            user_id: createdUser.id,
            role: 'owner'
          });

          await supabase.from('store_settings').insert({
            merchant_id: insMerchant.id,
            store_name: data.storeName,
            is_open: true,
            currency: '₱',
            delivery_fee: 50
          });
        }
      }
    } catch (e) {
      console.warn('[authService] Error executing merchant creation onboarding:', e);
    }

    // 3. Resolve and return active state
    const resolved = await this.resolveUserData(createdUser.id, createdUser.email || data.email);
    return {
      ...resolved,
      isLoading: false,
      isDemoMode: false,
      error: null
    };
  },

  /**
   * Merchant Sign In flow
   */
  async signIn(credentials: MerchantLoginCredentials): Promise<AuthState> {
    if (!this.isConfigured() || !supabase) {
      // Demo login
      return {
        user: DEMO_USER,
        profile: DEMO_PROFILE,
        merchant: INITIAL_MERCHANT,
        role: 'owner',
        memberships: [DEMO_MEMBERSHIP],
        isAuthenticated: true,
        isLoading: false,
        isDemoMode: true,
        error: null
      };
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Sign in failed: No user returned.');
    }

    const resolved = await this.resolveUserData(authData.user.id, authData.user.email || credentials.email);

    return {
      ...resolved,
      isLoading: false,
      isDemoMode: false,
      error: null
    };
  },

  /**
   * Create Store for already authenticated user who has no store yet
   */
  async createStore(data: MerchantCreateStoreData): Promise<AuthState> {
    if (!this.isConfigured() || !supabase) {
      const localMerchant: Merchant = {
        id: `merchant-${Date.now()}`,
        name: data.storeName,
        slug: data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        createdAt: new Date().toISOString()
      };
      return {
        user: DEMO_USER,
        profile: DEMO_PROFILE,
        merchant: localMerchant,
        role: 'owner',
        memberships: [{
          id: `mem-${Date.now()}`,
          merchantId: localMerchant.id,
          userId: DEMO_USER.id,
          role: 'owner'
        }],
        isAuthenticated: true,
        isLoading: false,
        isDemoMode: true,
        error: null
      };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required to create a store.');
    }

    const slug = data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + user.id.substring(0, 6);

    const { error: rpcError } = await supabase.rpc('create_merchant_with_owner', {
      p_name: data.storeName,
      p_slug: slug,
      p_description: data.description || `Welcome to ${data.storeName}! Enjoy our best offerings.`,
      p_currency: data.currency || '₱',
      p_delivery_fee: data.deliveryFee ?? 50,
      p_phone: data.phone || '+63 900 000 0000',
      p_address: data.address || 'Metro Manila, Philippines'
    });

    if (rpcError) {
      console.warn('[authService] RPC create_merchant_with_owner failed, trying direct insert:', rpcError.message);
      const { data: insMerchant, error: mErr } = await supabase
        .from('merchants')
        .insert({
          name: data.storeName,
          slug,
          owner_id: user.id
        })
        .select()
        .single();

      if (mErr || !insMerchant) {
        throw new Error(rpcError?.message || mErr?.message || 'Failed to create merchant.');
      }

      await supabase.from('merchant_members').insert({
        merchant_id: insMerchant.id,
        user_id: user.id,
        role: 'owner'
      });

      await supabase.from('store_settings').insert({
        merchant_id: insMerchant.id,
        store_name: data.storeName,
        is_open: true,
        currency: data.currency || '₱',
        delivery_fee: data.deliveryFee ?? 50,
        phone: data.phone || '',
        address: data.address || ''
      });
    }

    const resolved = await this.resolveUserData(user.id, user.email || '');
    return {
      ...resolved,
      isLoading: false,
      isDemoMode: false,
      error: null
    };
  },

  /**
   * Sign Out flow
   */
  async signOut(): Promise<void> {
    try {
      localStorage.removeItem('vendora_orders_cache');
      localStorage.removeItem('vendora_products_cache');
      localStorage.removeItem('vendora_categories_cache');
      localStorage.removeItem('vendora_customers_cache');
      localStorage.removeItem('vendora_settings_cache');
    } catch (e) {
      console.warn('[authService] Failed to clear local cache on signout', e);
    }

    if (this.isConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[authService] Supabase sign out error:', err);
      }
    }
  },

  /**
   * Switch active merchant if user belongs to multiple merchants
   */
  async switchMerchant(merchantId: string, currentUserId: string): Promise<{ merchant: Merchant | null; role: 'owner' | 'admin' | 'staff' | null }> {
    if (!this.isConfigured() || !supabase) {
      return { merchant: INITIAL_MERCHANT, role: 'owner' };
    }

    const { data: dbMembership } = await supabase
      .from('merchant_members')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('user_id', currentUserId)
      .single();

    if (!dbMembership) {
      throw new Error('Access denied: You are not a member of this merchant.');
    }

    const { data: dbMerchant } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single();

    return {
      merchant: dbMerchant ? mapDbMerchantToMerchant(dbMerchant as DbMerchant) : null,
      role: dbMembership.role as 'owner' | 'admin' | 'staff'
    };
  },

  /**
   * Subscribe to Auth State Changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (this.isConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
      return subscription;
    }
    return { unsubscribe: () => {} };
  }
};
