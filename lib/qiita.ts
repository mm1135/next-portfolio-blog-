import { createServerSupabaseClient } from '@/lib/supabase-server';

interface QiitaCredentials {
  access_token: string;
}

// Qiitaのアクセストークンを保存
export async function saveQiitaToken(accessToken: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('認証が必要です');
    }
    
    const { error } = await supabase
      .from('qiita_credentials')
      .upsert({
        user_id: session.user.id,
        access_token: accessToken,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Qiitaトークンの保存に失敗:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Qiitaトークン保存中にエラーが発生:', error);
    return false;
  }
}

// サーバーサイド専用の関数として明示
export async function getQiitaCredentialsServer(): Promise<QiitaCredentials | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('qiita_credentials')
      .select('access_token')
      .eq('user_id', session.user.id)
      .single();
    
    if (error || !data) {
      console.error('Qiitaの認証情報の取得に失敗:', error);
      return null;
    }
    
    return data as QiitaCredentials;
  } catch (error) {
    console.error('Qiitaの認証情報の取得中にエラーが発生:', error);
    return null;
  }
}

// Qiitaに投稿する関数 - クライアントでも使用できるように修正
export async function postToQiita(title: string, content: string, tags: string[] = []): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // APIエンドポイント経由で投稿
    const response = await fetch('/api/qiita/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content,
        tags
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: `Qiitaへの投稿に失敗: ${errorData}` };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Qiitaへの投稿中にエラーが発生:', error);
    return { success: false, error: String(error) };
  }
} 