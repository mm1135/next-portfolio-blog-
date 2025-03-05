import { createServerComponentClient as createComponentClient } from '@supabase/auth-helpers-nextjs';
import type { CookieOptions } from '@supabase/auth-helpers-shared';

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
export function createPagesRouterSupabaseClient(cookieValue?: {[key: string]: string}) {
  // このバージョンはGETリクエスト時に使用する
  return createComponentClient({ 
    cookieOptions: {
      name: "supabase-auth-token",
      get: () => cookieValue ? JSON.stringify(cookieValue) : null,
      set: () => {},
      remove: () => {}
    } as CookieOptions
  });
}

// 環境を検出して適切なクライアントを提供
export async function createServerSupabaseClient(cookieValue?: {[key: string]: string}) {
  if (typeof window !== 'undefined') {
    throw new Error('このメソッドはサーバーサイドでのみ使用できます');
  }
  
  try {
    // App Router環境で実行を試みる
    return await createAppRouterSupabaseClient();
  } catch (error) {
    // App Router環境でなければPages Router用のクライアントを返す
    return createPagesRouterSupabaseClient(cookieValue);
  }
}

// より簡潔なエクスポートもプロバイド
export { createAppRouterSupabaseClient as createAppClient };
export { createPagesRouterSupabaseClient as createPagesClient }; 