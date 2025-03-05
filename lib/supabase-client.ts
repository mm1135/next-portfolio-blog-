import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// クライアントコンポーネント用のSupabaseクライアント
export function getSupabaseClient() {
  return createClientComponentClient();
}

// Qiitaの認証情報をクライアント側で取得
export async function getQiitaCredentialsClient() {
  try {
    const supabase = getSupabaseClient();
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
    
    return data;
  } catch (error) {
    console.error('Qiitaの認証情報の取得中にエラーが発生:', error);
    return null;
  }
}

// Qiitaのアクセストークンをクライアント側で保存
export async function saveQiitaTokenClient(accessToken: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
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