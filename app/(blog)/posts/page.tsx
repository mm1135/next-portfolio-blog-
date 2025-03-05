import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllPosts, Post } from "@/lib/posts";

// このページはサーバーコンポーネントですので、クライアントに送信されるJSは最小限
export default async function PostsPage() {
  // Supabaseから記事データを取得
  const posts = await getAllPosts();
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">記事一覧</h1>
      
      {posts.length === 0 ? (
        <p className="text-gray-500">現在記事はありません。</p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <div key={post.id} className="border p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-2">
                <Link href={`/posts/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-500 mb-3">
                {new Date(post.created_at).toLocaleDateString('ja-JP')}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <Button asChild className="mt-2" variant="outline">
                <Link href={`/posts/${post.id}`}>記事を読む</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <Button asChild className="mt-8">
        <Link href="/">ホームに戻る</Link>
      </Button>
    </div>
  );
} 