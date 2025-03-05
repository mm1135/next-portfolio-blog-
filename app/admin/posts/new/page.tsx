"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPost } from "@/lib/posts";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";

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

    try {
      // タグを配列に変換
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const result = await createPost({
        title: formData.title,
        content: formData.content,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        tags: tagsArray,
        published: formData.published
      });

      if (result) {
        router.push('/admin');
      } else {
        alert('記事の作成に失敗しました。');
      }
    } catch (error) {
      console.error('エラーが発生しました:', error);
      alert('記事の作成中にエラーが発生しました。');
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            <label htmlFor="published">公開する</label>
          </div>

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