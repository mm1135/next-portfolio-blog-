import { createClient } from '@supabase/supabase-js';

// 環境変数が空の場合のエラー処理を追加
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase環境変数が設定されていません。');
}

// Supabaseクライアントを作成
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // サーバーサイドレンダリングでlocalStorageエラーを防ぐ
    // クライアント側でのみlocalStorageを使用
    ...(typeof window !== 'undefined' 
      ? { 
          storage: {
            getItem: (key) => window.localStorage.getItem(key),
            setItem: (key, value) => window.localStorage.setItem(key, value),
            removeItem: (key) => window.localStorage.removeItem(key),
          } 
        } 
      : {})
  }
});

export default supabase; 