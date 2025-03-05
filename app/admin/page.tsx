"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllPosts, Post, deletePost } from "@/lib/posts";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import ActivityHeatmap from '@/components/common/ActivityHeatmap';

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/admin/login');
      }
    };
    
    checkSession();
  }, [supabase, router]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const fetchedPosts = await getAllPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("投稿の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この記事を削除してもよろしいですか？この操作は元に戻せません。")) {
      return;
    }

    setDeleting(id);
    try {
      const success = await deletePost(id);
      if (success) {
        // 記事の一覧を更新
        setPosts(posts.filter(post => post.id !== id));
      } else {
        alert("記事の削除に失敗しました。");
      }
    } catch (error) {
      console.error("削除中にエラーが発生しました:", error);
      alert("記事の削除中にエラーが発生しました。");
    } finally {
      setDeleting(null);
    }
  };

  if (!session) {
    return <div>読み込み中...</div>;
  }

  if (loading) {
    return <div className="container mx-auto py-12">読み込み中...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">管理画面</h1>
      
      {/* アクティビティヒートマップを追加 */}
      <ActivityHeatmap isAdmin={true} />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">記事管理</h1>
        <Button asChild>
          <Link href="/admin/posts/new">新規記事作成</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {posts.length === 0 ? (
          <p>投稿がありません。新しい記事を作成してみましょう。</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border p-6 rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  {!post.published && <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">下書き</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/posts/${post.id}/edit`}>編集</Link>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={deleting === post.id}
                  onClick={() => handleDelete(post.id)}
                >
                  {deleting === post.id ? "削除中..." : "削除"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 