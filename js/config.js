/**
 * CityCare - Supabase Configuration
 * 
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your actual credentials 
 * from your Supabase Project Settings -> API.
 */

const SUPABASE_CONFIG = {
  // Example: 'https://xyzcompany.supabase.co'
  SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
  
  // Example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE',

  // Storage bucket name created in Supabase Dashboard
  STORAGE_BUCKET: 'complaint-images'
};

// Check if valid credentials are provided
function isSupabaseConfigured() {
  return (
    SUPABASE_CONFIG.SUPABASE_URL && 
    SUPABASE_CONFIG.SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' &&
    SUPABASE_CONFIG.SUPABASE_ANON_KEY && 
    SUPABASE_CONFIG.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE'
  );
}
