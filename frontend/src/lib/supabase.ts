import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tbabfvaohalhmtzrtgty.supabase.co';
// Ensure we have a valid anon key for client-side use
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiYWJmdmFvaGFsaG10enJ0Z3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjMwMTIsImV4cCI6MjA5NTgzOTAxMn0.oqk4VFSkDb6HfZYsB1M3vZmDPrzem48F4nIj6Ry9Ejs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
