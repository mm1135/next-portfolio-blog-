"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [hasSession, setHasSession] = useState(false);
  
  useEffect(() => {
    // コンポーネントマウント時にセッションをチェック
    const checkSession = async () => {
      try {
        console.log("ログアウトボタン: セッションチェック開始");
        const { data } = await supabase.auth.getSession();
        console.log("セッション状態:", !!data.session);
        setHasSession(!!data.session);
      } catch (error) {
        console.error("セッションチェックエラー:", error);
      }
    };
    
    checkSession();
    
    // セッション変更をリッスン
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("認証状態変更:", event, !!session);
      setHasSession(!!session);
    });
    
    // クリーンアップ関数
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
  
  // 初期状態ではデフォルトでボタンを表示（セッションチェック前）
  useEffect(() => {
    console.log("ログアウトボタン hasSession:", hasSession);
  }, [hasSession]);
  
  const handleLogout = async () => {
    try {
      console.log("ログアウト処理開始");
      // クライアント側でのログアウト処理
      await supabase.auth.signOut();
      
      // サーバー側のログアウト処理を呼び出し
      const res = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        // 明示的にログインページへリダイレクト
        console.log("ログアウト成功 - リダイレクト開始");
        router.push('/admin/login');
        router.refresh();
      }
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };
  
  // 常にログアウトボタンを表示する（デバッグのため）
  return (
    <button 
      onClick={handleLogout} 
      className="text-sm hover:underline"
    >
      {hasSession ? "ログアウト" : null}
    </button>
  );
} 