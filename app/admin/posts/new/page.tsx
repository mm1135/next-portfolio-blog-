"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPost, recordPostActivity } from "@/lib/posts";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { postToQiita } from '@/lib/qiita';
import { getQiitaCredentialsClient } from '@/lib/supabase-client';

export default function NewPostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    slug: "",
    tags: "",
    published: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);
  const [qiitaEnabled, setQiitaEnabled] = useState(false);
  const [qiitaConnected, setQiitaConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkQiitaConnection = async () => {
      const credentials = await getQiitaCredentialsClient();
      console.log('Qiita接続状態:', !!credentials);
      setQiitaConnected(!!credentials);
    };
    
    checkQiitaConnection();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!formData.title || !formData.content) {
        throw new Error('タイトルと本文は必須です');
      }

      // APIルートを使用してサーバーサイドで投稿
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '投稿処理に失敗しました');
      }
      
      console.log('投稿成功:', result.id);
      
      // Qiitaにも投稿する（チェックボックスが有効な場合）
      if (qiitaEnabled && qiitaConnected) {
        try {
          console.log('Qiita投稿開始...');
          const tagsArray = formData.tags
            ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            : [];
          
          const qiitaResult = await postToQiita(
            formData.title,
            formData.content,
            tagsArray
          );
          
          if (qiitaResult.success) {
            console.log('Qiitaにも投稿しました:', qiitaResult.url);
          } else {
            console.error('Qiita投稿エラー:', qiitaResult.error);
          }
        } catch (qiitaError) {
          console.error('Qiita投稿処理エラー:', qiitaError);
          // Qiita投稿エラーはブログ投稿には影響しない
        }
      }
      
      router.push('/admin');
    } catch (err) {
      console.error('エラー:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">新規記事作成</h1>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant={preview ? "default" : "outline"}
            onClick={() => setPreview(!preview)}
          >
            {preview ? "編集モード" : "プレビュー"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin">キャンセル</Link>
          </Button>
        </div>
      </div>

      {preview ? (
        <div className="border p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">{formData.title || "タイトル未設定"}</h2>
          <div className="prose prose-stone max-w-none">
            <MarkdownRenderer content={formData.content || "内容がありません"} />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">タイトル</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">スラッグ (URL)</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="空白の場合はタイトルから自動生成されます"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">タグ (カンマ区切り)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Next.js, React, Tutorial"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">内容 (マークダウン)</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="published" className="text-sm font-medium">
              公開する（チェックを外すと下書きとして保存されます）
            </label>
          </div>

          {qiitaConnected && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="qiitaEnabled"
                name="qiitaEnabled"
                checked={qiitaEnabled}
                onChange={(e) => setQiitaEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={!qiitaConnected}
              />
              <label htmlFor="qiitaEnabled" className="text-sm font-medium">
                Qiitaにも同時投稿する（公開設定時のみ有効）
              </label>
            </div>
          )}
          
          {!qiitaConnected && (
            <div className="text-sm text-gray-500">
              <Link href="/admin/settings/qiita" className="text-blue-500 hover:underline">
                Qitaと連携する
              </Link>
              と、記事を同時投稿できます
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存する"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
} 