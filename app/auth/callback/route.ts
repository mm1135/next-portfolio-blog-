import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('認証コールバックが呼び出されました');
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // コードをセッションに交換
      await supabase.auth.exchangeCodeForSession(code);
      console.log('セッションの交換が完了しました');
    } catch (error) {
      console.error('認証コールバックエラー:', error);
    }
  }
  
  // ログイン成功後に管理画面に遷移
  return NextResponse.redirect(new URL('/admin', request.url));
} 