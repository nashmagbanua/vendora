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
import { DbMerchant, mapDbMerchantToMerchant } from '../lib/dbMappers';

const LOCAL_USER_KEY = 'vendora_auth_user';
const LOCAL_MERCHANT_KEY = 'vendora_auth_merchant';

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
    } else {
      // Local fallback for development without Supabase credentials
      try {
        const savedUserStr = localStorage.getItem(LOCAL_USER_KEY);
        const savedMerchantStr = localStorage.getItem(LOCAL_MERCHANT_KEY);
        if (savedUserStr) {
          const user: User = JSON.parse(savedUserStr);
          const merchant: Merchant | null = savedMerchantStr ? JSON.parse(savedMerchantStr) : null;
          const membership: MerchantMember[] = merchant ? [{
            id: `mem-${user.id}`,
            merchantId: merchant.id,
            userId: user.id,
            role: 'owner',
            joinedAt: new Date().toISOString()
          }] : [];
          return {
            user,
            profile: { ...user },
            merchant,
            role: merchant ? 'owner' : null,
            memberships: membership,
            isAuthenticated: true,
            isLoading: false,
            isDemoMode: false,
            error: null
          };
        }
      } catch (e) {
        console.warn('[authService] Local auth parse error', e);
      }
    }

    // Default: not authenticated
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
  },

  /**
   * Resolve user profile, memberships, and active merchant from database
   */
  async resolveUserData(userId: string, email: string): Promise<Omit<AuthState, 'isLoading' | 'isDemoMode' | 'error'>> {
    if (!this.isConfigured() || !supabase) {
      const user: User = {
        id: userId,
        email,
        fullName: email.split('@')[0],
        role: 'owner',
        createdAt: new Date().toISOString()
      };
      return {
        user,
        profile: { ...user },
        merchant: null,
        role: null,
        memberships: [],
        isAuthenticated: true
      };
    }

    try {
      // 1. Fetch Profile
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

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

      let memberships: MerchantMember[] = (dbMemberships || []).map((m: any) => ({
        id: m.id,
        merchantId: m.merchant_id,
        userId: m.user_id,
        role: m.role as 'owner' | 'admin' | 'staff',
        joinedAt: m.joined_at
      }));

      // 3. Fallback check: if memberships is empty, check if user is direct owner of any merchant in merchants table
      if (memberships.length === 0) {
        const { data: ownedMerchants, error: ownErr } = await supabase
          .from('merchants')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false });

        if (!ownErr && ownedMerchants && ownedMerchants.length > 0) {
          for (const om of ownedMerchants) {
            memberships.push({
              id: `mem-owner-${om.id}`,
              merchantId: om.id,
              userId: userId,
              role: 'owner',
              joinedAt: om.created_at
            });

            // Self-heal the missing merchant_members entry in the background
            try {
              await supabase.from('merchant_members').insert({
                merchant_id: om.id,
                user_id: userId,
                role: 'owner'
              });
            } catch (healErr) {
              // Ignore if already existing
            }
          }
        }
      }

      // 4. If member of at least one merchant, fetch the primary merchant
      let merchant: Merchant | null = null;
      let role: 'owner' | 'admin' | 'staff' | null = null;

      if (memberships.length > 0) {
        const primaryMembership = memberships[0];
        role = primaryMembership.role;

        const { data: dbMerchant, error: mErr } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', primaryMembership.merchantId)
          .maybeSingle();

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
      // Local Mode Signup
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

      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
        localStorage.setItem(LOCAL_MERCHANT_KEY, JSON.stringify(localMerchant));
      } catch (e) {
        console.warn('[authService] Failed to persist local user', e);
      }

      return {
        user: localUser,
        profile: { ...localUser },
        merchant: localMerchant,
        role: 'owner',
        memberships: [localMembership],
        isAuthenticated: true,
        isLoading: false,
        isDemoMode: false,
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

    // 2. Check if a valid session was issued or if email confirmation is required
    if (!authData.session) {
      // Email confirmation is required. Do NOT call RPC or attempt database inserts without an active session.
      return {
        user: null,
        profile: null,
        merchant: null,
        role: null,
        memberships: [],
        isAuthenticated: false,
        isLoading: false,
        isDemoMode: false,
        error: null,
        requiresEmailConfirmation: true,
        confirmationEmail: data.email
      };
    }

    // 3. If an active session exists (email confirmation disabled), atomically create Merchant, Membership & Settings
    const { error: rpcError } = await supabase.rpc('create_merchant_with_owner', {
      p_name: data.storeName,
      p_slug: data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + createdUser.id.substring(0, 6),
      p_description: `Welcome to ${data.storeName}! Enjoy our best offerings.`,
      p_currency: '₱',
      p_delivery_fee: 50,
      p_phone: data.phone || '+63 900 000 0000',
      p_address: data.address || 'Metro Manila, Philippines'
    });

    if (rpcError) {
      console.error('[authService] RPC create_merchant_with_owner error:', rpcError.message);
      throw new Error(`Store creation failed: ${rpcError.message}`);
    }

    // 4. Resolve and return active state
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
      // Local sign in fallback
      const localUser: User = {
        id: `user-${credentials.email.replace(/[^a-z0-9]/gi, '')}`,
        email: credentials.email,
        fullName: credentials.email.split('@')[0],
        role: 'owner',
        createdAt: new Date().toISOString()
      };
      const savedMerchantStr = localStorage.getItem(LOCAL_MERCHANT_KEY);
      const merchant: Merchant | null = savedMerchantStr ? JSON.parse(savedMerchantStr) : null;
      const memberships: MerchantMember[] = merchant ? [{
        id: `mem-${localUser.id}`,
        merchantId: merchant.id,
        userId: localUser.id,
        role: 'owner',
        joinedAt: new Date().toISOString()
      }] : [];

      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
      } catch (e) {
        console.warn('[authService] Failed to persist local user', e);
      }

      return {
        user: localUser,
        profile: { ...localUser },
        merchant,
        role: merchant ? 'owner' : null,
        memberships,
        isAuthenticated: true,
        isLoading: false,
        isDemoMode: false,
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
      const localUserStr = localStorage.getItem(LOCAL_USER_KEY);
      const user: User = localUserStr ? JSON.parse(localUserStr) : {
        id: `user-${Date.now()}`,
        email: 'merchant@store.ph',
        fullName: 'Store Owner',
        role: 'owner',
        createdAt: new Date().toISOString()
      };

      const localMerchant: Merchant = {
        id: `merchant-${Date.now()}`,
        name: data.storeName,
        slug: data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ownerId: user.id,
        createdAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(LOCAL_MERCHANT_KEY, JSON.stringify(localMerchant));
      } catch (e) {
        console.warn('[authService] Failed to persist merchant', e);
      }

      return {
        user,
        profile: { ...user },
        merchant: localMerchant,
        role: 'owner',
        memberships: [{
          id: `mem-${Date.now()}`,
          merchantId: localMerchant.id,
          userId: user.id,
          role: 'owner'
        }],
        isAuthenticated: true,
        isLoading: false,
        isDemoMode: false,
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
      console.error('[authService] RPC create_merchant_with_owner failed:', rpcError.message);
      throw new Error(rpcError.message || 'Failed to create store.');
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
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem(LOCAL_MERCHANT_KEY);
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
        console.error('[authService] Supabase signOut error:', err);
      }
    }
  },

  /**
   * Switch active merchant if user belongs to multiple merchants
   */
  async switchMerchant(merchantId: string, currentUserId: string): Promise<{ merchant: Merchant | null; role: 'owner' | 'admin' | 'staff' | null }> {
    if (!this.isConfigured() || !supabase) {
      return { merchant: null, role: 'owner' };
    }

    const { data: dbMembership } = await supabase
      .from('merchant_members')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (!dbMembership) {
      throw new Error('Access denied: You are not a member of this merchant.');
    }

    const { data: dbMerchant } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .maybeSingle();

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
