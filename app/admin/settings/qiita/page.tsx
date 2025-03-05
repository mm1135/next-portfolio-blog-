"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getQiitaCredentialsClient, saveQiitaTokenClient } from '@/lib/supabase-client';

export default function QiitaSettings() {
  const [accessToken, setAccessToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  useEffect(() => {
    // 既存の接続を確認
    const checkConnection = async () => {
      const credentials = await getQiitaCredentialsClient();
      if (credentials) {
        setIsConnected(true);
      }
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      if (!accessToken.trim()) {
        setMessage({ text: 'アクセストークンを入力してください', type: 'error' });
        setIsSubmitting(false);
        return;
      }
      
      const success = await saveQiitaTokenClient(accessToken);
      
      if (success) {
        setMessage({ text: 'Qiitaとの連携が完了しました', type: 'success' });
        setIsConnected(true);
        // フォームをリセット
        setAccessToken('');
        
        // 少し待ってから管理画面にリダイレクト
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      } else {
        setMessage({ text: 'Qiitaとの連携に失敗しました', type: 'error' });
      }
    } catch (error) {
      console.error('Qiita連携エラー:', error);
      setMessage({ text: 'エラーが発生しました', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Qiita連携設定</h1>
      
      {isConnected && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6">
          Qiitaと連携済みです。新しいトークンを入力すると更新されます。
        </div>
      )}
      
      {message.text && (
        <div className={`p-4 rounded-md mb-6 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="accessToken" className="block text-sm font-medium mb-2">
              Qiitaアクセストークン
            </label>
            <input
              type="text"
              id="accessToken"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Qiitaのアクセストークンを入力"
            />
            <p className="text-sm text-gray-500 mt-2">
              Qiitaの<a href="https://qiita.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                アクセストークン設定ページ
              </a>からトークンを発行してください。<br />
              最低限「read_qiita」と「write_qiita」のスコープが必要です。
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "処理中..." : isConnected ? "トークンを更新" : "連携する"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 