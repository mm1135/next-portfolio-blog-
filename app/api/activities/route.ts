import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const userId = searchParams.get('userId'); // ユーザーIDも取得可能に
    
    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: '開始日と終了日が必要です' },
        { status: 400 }
      );
    }
    
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // 検索範囲を調整
    startDate.setDate(startDate.getDate() - 1);
    endDate.setDate(endDate.getDate() + 1);
    
    // 非同期処理を使用してcookiesを取得
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // スキーマに存在するカラムのみを選択
    let query = supabase
      .from('posts')
      .select('id, created_at')  // updated_atは存在しないので削除
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('published', true);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('投稿の取得に失敗:', error);
      return NextResponse.json(
        { error: '投稿の取得に失敗しました' },
        { status: 500 }
      );
    }
    
    console.log(`公開記事数: ${data?.length || 0}`);
    
    // 存在するカラムのみを使用
    const activities = data?.map(post => ({
      id: post.id,
      created_at: post.created_at,
      post_id: post.id,
      activity_type: 'publish'
      // user_idとtitleは選択していないので除外
    })) || [];
    
    return NextResponse.json({ activities });
  } catch (error) {
    console.error('APIエラー:', error);
    return NextResponse.json(
      { error: 'アクティビティの取得に失敗しました' },
      { status: 500 }
    );
  }
} 