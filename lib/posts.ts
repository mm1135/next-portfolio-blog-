import supabase from './supabase';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// 直接インポートではなく、動的にインポートするように変更
// import { cookies } from "next/headers";
import { Post as PostType } from '@/types/post';


// 環境によってインポートを分離するためのフラグ
const isAppRouter = process.env.NEXT_RUNTIME === 'nodejs';

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

// 全記事を取得 (管理者向け - 下書きも含む)
export async function getAllPosts(includeUnpublished = false): Promise<Post[]> {
  const query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
    
  // 公開済みのみにフィルタリングするかどうか
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

// createPost関数を修正
export async function createPost(postData: {
  title: string;
  content: string;
  slug: string;
  tags: string[];
  published: boolean;
}): Promise<CreatePostResult> {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        title: postData.title,
        content: postData.content,
        slug: postData.slug,
        tags: postData.tags,
        published: postData.published
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return { success: false };
  }
  
  return { 
    success: true,
    id: data.id
  };
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
    } catch (error) {
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

// 活動記録を保存する関数
export async function recordPostActivity(postId: number, activityType: 'create' | 'edit' | 'publish'): Promise<void> {
  try {
    const client = await getSupabaseServerClient();
    const sessionResult = await client.auth.getSession();
    const session = sessionResult.data.session;
    
    await client.from('post_activities').insert({
      post_id: postId,
      activity_type: activityType,
      user_id: session?.user?.id || 'anonymous',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to record activity:', error);
  }
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
      } catch (error) {
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