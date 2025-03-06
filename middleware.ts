import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// この関数はサーバーサイドで実行される
export async function middleware(request: NextRequest) {
  // デバッグ用のログ
  console.log('ミドルウェア実行パス:', request.nextUrl.pathname);
  
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });
    
    // セッション取得（一度だけ）
    const { data: { session } } = await supabase.auth.getSession();
    console.log('セッション状態:', !!session);
    
    // /admin/* へのアクセス（ただし/admin/loginを除く）
    if (request.nextUrl.pathname.startsWith('/admin') && 
        !request.nextUrl.pathname.startsWith('/admin/login')) {
      
      if (!session) {
        console.log('未認証アクセス - ログインページへリダイレクト');
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
      
      // 認証済みの場合はそのまま続行
      return res;
    }
    
    // /admin/login へのアクセス
    if (request.nextUrl.pathname.startsWith('/admin/login')) {
      if (session) {
        console.log('既にログイン済み - 管理画面へリダイレクト');
        const adminUrl = new URL('/admin', request.url);
        return NextResponse.redirect(adminUrl);
      }
      
      // 未認証の場合はそのまま続行
      return res;
    }
    
    // 他のパスはそのまま通過
    return res;
  } catch (error) {
    console.error('ミドルウェアエラー:', error);
    // エラー時は通常どおり続行（リダイレクトしない）
    return NextResponse.next();
  }
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: ['/admin/:path*']
}; 