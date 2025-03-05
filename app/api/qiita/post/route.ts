import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    const { title, content, tags } = await request.json();
    
    // 認証確認
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }
    
    // Qiitaの認証情報を取得
    const { data, error } = await supabase
      .from('qiita_credentials')
      .select('access_token')
      .eq('user_id', session.user.id)
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Qiita認証情報がありません' },
        { status: 400 }
      );
    }
    
    // Qiitaに投稿
    const qiitaTags = tags.map((tag: string) => ({ name: tag }));
    
    const qiitaResponse = await fetch('https://qiita.com/api/v2/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.access_token}`
      },
      body: JSON.stringify({
        title,
        body: content,
        private: false,
        tags: qiitaTags
      })
    });
    
    if (!qiitaResponse.ok) {
      const errorText = await qiitaResponse.text();
      return NextResponse.json(
        { success: false, error: `Qiitaへの投稿に失敗: ${errorText}` },
        { status: 400 }
      );
    }
    
    const qiitaData = await qiitaResponse.json();
    
    return NextResponse.json({ 
      success: true,
      url: qiitaData.url
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 