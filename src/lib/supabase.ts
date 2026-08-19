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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        '[Supabase] Missing environment variables.\n' +
        'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are defined in .env'
    );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
