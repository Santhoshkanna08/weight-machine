/**
 * src/lib/supabase.ts
 * -------------------
 * Single, reusable Supabase client for the entire application.
 *
 * Reads credentials from Vite environment variables:
 *   VITE_SUPABASE_URL             – your project URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY – the browser-safe anon/publishable key
 *
 * NEVER import or use the service-role secret key in frontend code.
 */
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '') as string;
export const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '') as string;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseKey)
    : (null as unknown as ReturnType<typeof createClient>);
