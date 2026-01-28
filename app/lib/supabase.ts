import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버 사이드에서 사용할 클라이언트 (Service Role Key 사용)
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    console.error('Supabase environment variables missing:', {
      hasUrl: !!url,
      hasServiceKey: !!serviceKey,
    });
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(url, serviceKey);
}
