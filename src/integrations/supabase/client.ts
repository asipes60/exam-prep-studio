import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://axcwegrylfnadgbzgqnv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Y3dlZ3J5bGZuYWRnYnpncW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk1NjQsImV4cCI6MjA4OTQ5NTU2NH0.ssSoyXjKpN8jcorVi2_suqRCSS_hs6nRqNVJnBUj6_Y";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Disable navigator.locks which deadlocks in some environments with supabase-js v2.39+
    lock: (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn(),
  }
});