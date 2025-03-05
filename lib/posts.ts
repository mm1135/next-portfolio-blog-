import supabase from './supabase';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// 直接インポートではなく、動的にインポートするように変更
// import { cookies } from "next/headers";
import { Post as PostType } from '@/types/post';

// PostDBType を使用して既存の関数を動作させる
// PostType を使用して新しい関数を実装する

// 既存の Post 型を名前変更する
export type Post = {
  id: number;
  created_at: string;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  tags: string[];
};

// 全記事を取得 (管理者向け - includeUnpublishedがtrueなら下書きも含む)
export async function getAllPosts(includeUnpublished = true): Promise<Post[]> {
  const query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
    
  // 管理画面では常に下書きも表示する
  if (!includeUnpublished) {
    query.eq('published', true);
  }
  
  const { data, error } = await query;
    
  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  
  return data || [];
}

// 特定のIDの記事を取得
export async function getPostById(id: number): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single();
    
  if (error) {
    console.error(`Error fetching post with ID ${id}:`, error);
    return null;
  }
  
  return data;
}

// スラッグで記事を取得
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
    
  if (error) {
    console.error(`Error fetching post with slug ${slug}:`, error);
    return null;
  }
  
  return data;
}

// タグで記事をフィルタリング
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .contains('tags', [tag])
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(`Error fetching posts with tag ${tag}:`, error);
    return [];
  }
  
  return data || [];
}

// 型定義を修正
type CreatePostResult = {
  success: boolean;
  id?: number;
};

// 新規投稿を作成 - 根本的修正版
export async function createPost(postData: {
  title: string;
  content: string;
  slug: string;
  tags: string;
  published: boolean;
}): Promise<number | null> {
  console.log('Supabaseクライアント:', supabase);
  
  try {
    // より単純なデータ構造で試す
    const simpleData = {
      title: postData.title,
      content: postData.content,
      slug: postData.slug || generateSlug(postData.title),
      published: postData.published,
      // 単純な文字列として保存（配列変換を避ける）
      tags: postData.tags ? postData.tags.split(',').map(t => t.trim()).join(',') : ''
    };
    
    console.log('シンプル挿入データ:', simpleData);
    
    // 挿入のみを試す
    const insertResult = await supabase
      .from('posts')
      .insert(simpleData);
      
    console.log('挿入結果:', insertResult);
    
    if (insertResult.error) {
      console.error('挿入エラー:', insertResult.error);
      return null;
    }
    
    // 挿入成功後に最新の投稿を取得
    const { data: latestPost } = await supabase
      .from('posts')
      .select('id')
      .eq('title', postData.title)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (!latestPost) {
      console.error('投稿はされたが、IDを取得できませんでした');
      return null;
    }
    
    const postId = latestPost.id;
    console.log('投稿成功、ID:', postId);
    
    return postId;
  } catch (e) {
    console.error('投稿中の例外:', e);
    return null;
  }
}

// 投稿用のスラグを生成
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// 投稿活動を記録
export async function recordPostActivity(postId: number): Promise<void> {
  try {
    await supabase
      .from('post_activities')
      .insert({
        post_id: postId,
        activity_type: 'publish'
      });
  } catch (error) {
    console.error('活動記録エラー:', error);
  }
}

// 記事を更新
export async function updatePost(id: number, updates: Partial<Omit<Post, 'id' | 'created_at'>>): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating post with ID ${id}:`, error);
    return null;
  }
  
  return data;
}

// 記事を削除
export async function deletePost(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error deleting post with ID ${id}:`, error);
    return false;
  }
  
  return true;
}

// サーバーサイドのSupabaseクライアント取得関数
async function getSupabaseServerClient() {
  if (typeof window === 'undefined') {
    try {
      // App Router用のサーバーサイドクライアント
      const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs');
      const { cookies } = await import('next/headers');
      return createServerComponentClient({ cookies });
    } catch {
      // Pages Router用のフォールバック
      console.warn('Server component client failed, falling back to default client');
      return supabase;
    }
  }
  
  // クライアントサイドの場合は通常のクライアントを返す
  return supabase;
}

// 投稿活動を記録するためのテーブル構造
interface PostActivity {
  id: number;
  post_id: number;
  activity_type: 'create' | 'edit' | 'publish';
  created_at: string;
  user_id: string;
}

// 特定期間の活動データを取得する関数
export async function getPostActivities(startDate: Date, endDate: Date): Promise<PostActivity[]> {
  try {
    const client = await getSupabaseServerClient();
    
    const { data, error } = await client
      .from('post_activities')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get activities:', error);
    return [];
  }
}

// 最新の記事を取得
export async function getRecentPosts(limit = 3): Promise<PostType[]> {
  try {
    // 動的にインポートしてApp Routerでのみ使用する
    let supabaseClient;
    
    if (typeof window === 'undefined') {
      try {
        // App Router環境の場合
        const { cookies } = await import('next/headers');
        const cookieStore = cookies();
        supabaseClient = createServerComponentClient({ 
          cookies: () => cookieStore 
        });
      } catch {
        // Pages Router環境の場合はフォールバック
        console.warn('Using default supabase client');
        supabaseClient = supabase;
      }
    } else {
      // クライアントサイドの場合
      supabaseClient = supabase;
    }
    
    const { data, error } = await supabaseClient
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('記事取得エラー:', error);
      return [];
    }
    
    // データ変換
    return data.map(post => ({
      id: post.id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || post.content.substring(0, 100) + '...',
      thumbnail: post.thumbnail_url || '/images/post-placeholder.jpg',
      publishedAt: post.published_at || post.created_at,
      categories: post.categories || post.tags || [],
      readingTime: calculateReadingTime(post.content)
    }));
  } catch (error) {
    console.error('記事取得処理エラー:', error);
    return [];
  }
}

// 記事の読む時間を計算（文字数から推定）
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 500; // 1分あたりの文字数
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes}分`;
} 