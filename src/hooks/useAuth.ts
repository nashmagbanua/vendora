import { useState, useEffect, useCallback } from 'react';
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
import { authService } from '../services/authService';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    merchant: null,
    role: null,
    memberships: [],
    isAuthenticated: false,
    isLoading: true,
    isDemoMode: false,
    error: null
  });

  // Restore session on mount & subscribe to Supabase Auth state changes
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const state = await authService.getInitialAuthState();
        if (isMounted) {
          setAuthState(state);
        }
      } catch (err: any) {
        if (isMounted) {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: err?.message || 'Failed to initialize authentication.'
          }));
        }
      }
    }

    initAuth();

    const subscription = authService.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          try {
            const resolved = await authService.resolveUserData(
              session.user.id,
              session.user.email || ''
            );
            if (isMounted) {
              setAuthState({
                ...resolved,
                isLoading: false,
                isDemoMode: false,
                error: null
              });
            }
          } catch (err: any) {
            if (isMounted) {
              setAuthState((prev) => ({
                ...prev,
                isLoading: false,
                error: err?.message || 'Failed to resolve user session.'
              }));
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setAuthState({
            user: null,
            profile: null,
            merchant: null,
            role: null,
            memberships: [],
            isAuthenticated: false,
            isLoading: false,
            isDemoMode: false,
            error: null
          });
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (credentials: MerchantLoginCredentials) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const state = await authService.signIn(credentials);
      setAuthState(state);
      return state;
    } catch (err: any) {
      const errMsg = err?.message || 'Invalid email or password. Please try again.';
      setAuthState((prev) => ({ ...prev, isLoading: false, error: errMsg }));
      throw err;
    }
  }, []);

  const signUp = useCallback(async (data: MerchantSignUpData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const state = await authService.signUp(data);
      setAuthState(state);
      return state;
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to create merchant account. Please try again.';
      setAuthState((prev) => ({ ...prev, isLoading: false, error: errMsg }));
      throw err;
    }
  }, []);

  const createStore = useCallback(async (data: MerchantCreateStoreData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const state = await authService.createStore(data);
      setAuthState(state);
      return state;
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to create store. Please try again.';
      setAuthState((prev) => ({ ...prev, isLoading: false, error: errMsg }));
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      await authService.signOut();
      setAuthState({
        user: null,
        profile: null,
        merchant: null,
        role: null,
        memberships: [],
        isAuthenticated: false,
        isLoading: false,
        isDemoMode: false,
        error: null
      });
    } catch (err: any) {
      setAuthState((prev) => ({ ...prev, isLoading: false, error: err?.message }));
    }
  }, []);

  const enableDemoMode = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    const demoState = await authService.getInitialAuthState();
    setAuthState({
      ...demoState,
      isDemoMode: true,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  }, []);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    signIn,
    signUp,
    createStore,
    signOut,
    enableDemoMode,
    clearError
  };
}
