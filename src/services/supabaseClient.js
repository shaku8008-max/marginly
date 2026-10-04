/**
 * Supabase client — single shared instance for the whole app.
 *
 * SECURITY NOTE:
 * Only the **anon key** is used here. The anon key is designed for browser use
 * and respects Supabase Row-Level Security (RLS) policies, so every query is
 * scoped to the authenticated user's permissions.
 *
 * The **service role key** must NEVER appear in frontend code — it bypasses
 * all RLS policies and gives full database access. It is only safe on a
 * server you control (e.g. an API route or edge function).
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;