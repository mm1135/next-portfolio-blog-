import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // リクエストボディを取得
    const postData = await request.json();
    
    // バリデーション
    if (!postData.title || !postData.content) {
      return NextResponse.json(
        { error: 'タイトルと本文は必須です' },
        { status: 400 }
      );
    }
    
    // サーバーサイドのSupabaseクライアントを作成
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // 認証確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    // タグの処理
    const tagsArray = postData.tags 
      ? postData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];
    
    // スラグの基本形を生成
    let baseSlug = postData.slug || postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // スラグの一意性を確保するための処理
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;
    
    // スラグが一意になるまでループ
    while (!isUnique) {
      // 現在のスラグで記事が存在するか確認
      const { data: existingPost, error } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) {
        console.error('スラグ確認エラー:', error);
        return NextResponse.json(
          { error: 'スラグの確認に失敗しました' },
          { status: 500 }
        );
      }
      
      // 記事が存在しなければ一意
      if (!existingPost) {
        isUnique = true;
      } else {
        // 存在する場合は連番を付ける
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
    
    console.log('生成されたユニークなスラグ:', slug);
    
    // データ挿入
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: postData.title,
        content: postData.content,
        slug,
        tags: tagsArray,
        published: postData.published
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('投稿エラー:', error);
      return NextResponse.json(
        { error: `投稿の作成に失敗しました: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      id: data.id,
      slug: slug // 作成されたスラグも返す
    });
  } catch (error) {
    console.error('API例外:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
} 