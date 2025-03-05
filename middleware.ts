import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// この関数はサーバーサイドで実行される
export async function middleware(request: NextRequest) {
  console.log('ミドルウェアが実行されました: ', request.nextUrl.pathname);
  
  // admin以下のパスへのアクセスをチェック（ログインページを除く）
  if (
    request.nextUrl.pathname.startsWith('/admin') && 
    !request.nextUrl.pathname.startsWith('/admin/login')
  ) {
    // レスポンスを作成
    const res = NextResponse.next();
    
    // Supabaseクライアントを初期化
    const supabase = createMiddlewareClient({ req: request, res });
    
    try {
      // セッションを取得
      const { data: { session } } = await supabase.auth.getSession();
      console.log('セッションチェック結果:', !!session);
      
      // セッションがない場合はログインページにリダイレクト
      if (!session) {
        console.log('セッションなし - ログインページへリダイレクト');
        const redirectUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(redirectUrl);
      }
      
      // セッションがある場合は続行
      return res;
    } catch (error) {
      console.error('認証エラー:', error);
      // エラー時もログインページにリダイレクト
      const redirectUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // admin/loginへのアクセスで、すでにログインしている場合は管理画面へリダイレクト
  if (request.nextUrl.pathname.startsWith('/admin/login')) {
    // レスポンスを作成
    const res = NextResponse.next();
    
    // Supabaseクライアントを初期化
    const supabase = createMiddlewareClient({ req: request, res });
    
    try {
      // セッションを取得
      const { data: { session } } = await supabase.auth.getSession();
      
      // セッションがある場合は管理画面にリダイレクト
      if (session) {
        console.log('すでにログイン済み - 管理画面へリダイレクト');
        const redirectUrl = new URL('/admin', request.url);
        return NextResponse.redirect(redirectUrl);
      }
      
      // セッションがない場合は続行
      return res;
    } catch (error) {
      // エラー時は通常通り続行
      return res;
    }
  }
  
  // その他のパスは通常通り処理
  return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: ['/admin/:path*']
}; 