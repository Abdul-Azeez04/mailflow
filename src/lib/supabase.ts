import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mnwjyqhrkyfstplewhzz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ud2p5cWhya3lmc3RwbGV3aHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjczMzcsImV4cCI6MjA4ODIwMzMzN30.gFdsZOcfsw3Y0ajyfiSelr1eA9q1qdLv3euDuH3AJzE';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { supabaseUrl, supabaseAnonKey };
