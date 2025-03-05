import { createServerComponentClient as createComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// App Router (app/ ディレクトリ)用
export async function createAppRouterSupabaseClient() {
  // 動的にimportして、ビルド時にPages Routerと競合しないようにする
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  return createComponentClient({ 
    cookies: () => cookieStore 
  });
}

// Pages Router (pages/ ディレクトリ)用
export function createPagesRouterSupabaseClient() {
  // このバージョンはGETリクエスト時に使用する
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // 代わりに直接createClientを使用
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      // cookieを手動で設定する代わりにセッションをメモリに保持
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

// 環境を検出して適切なクライアントを提供
export async function createServerSupabaseClient() {
  if (typeof window !== 'undefined') {
    throw new Error('このメソッドはサーバーサイドでのみ使用できます');
  }
  
  try {
    // App Router環境で実行を試みる
    return await createAppRouterSupabaseClient();
  } catch {
    return createPagesRouterSupabaseClient();
  }
}

// より簡潔なエクスポートもプロバイド
export { createAppRouterSupabaseClient as createAppClient };
export { createPagesRouterSupabaseClient as createPagesClient }; 