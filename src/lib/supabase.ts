import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http')
);

/**
 * Validates if a given string matches standard UUID v4/v1 format.
 * Prevents PostgreSQL 400 'invalid input syntax for type uuid' errors.
 */
export function isUUID(str: any): boolean {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
}

/**
 * Supabase client instance.
 * Initialized when valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present.
 * If not configured, returns null/mockable client and application runs in local/demo mode.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

if (!isSupabaseConfigured && process.env.NODE_ENV !== 'production') {
  // Helpful developer guidance in console during demo/dev mode
  console.info(
    '[Vendora Architecture] Supabase credentials not set. Running with local storage & seed data provider.'
  );
}
