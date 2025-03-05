import supabase from './supabase';

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

// 新しい記事を追加
export async function createPost(post: Omit<Post, 'id' | 'created_at'>): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single();
    
  if (error) {
    console.error(`Error creating post:`, error);
    return null;
  }
  
  return data;
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