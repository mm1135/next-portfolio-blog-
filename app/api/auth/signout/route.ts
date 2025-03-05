import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('サインアウト処理を開始します');
    
    // サーバーサイドでクッキーベースのクライアントを作成
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // セッションを取得して確認
    const { data: { session } } = await supabase.auth.getSession();
    console.log('ログアウト前のセッション:', !!session);
    
    // サインアウト実行
    const { error } = await supabase.auth.signOut({
      scope: 'global' // すべてのデバイスからログアウト
    });
    
    if (error) {
      console.error('サインアウトエラー:', error);
      throw error;
    }
    
    // セッション削除後の確認
    const { data: { session: checkSession } } = await supabase.auth.getSession();
    console.log('ログアウト後のセッション:', !!checkSession);
    
    // レスポンスオブジェクトにクッキークリア指示を追加
    const response = NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), {
      status: 302 // 一時的なリダイレクト
    });
    
    // Supabase認証クッキーを明示的に削除
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    
    console.log('サインアウト処理が完了しました');
    return response;
  } catch (error) {
    console.error('サインアウト処理中にエラーが発生しました:', error);
    return NextResponse.json({ error: 'ログアウトに失敗しました' }, { status: 500 });
  }
} 