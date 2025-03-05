import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPostById } from "@/lib/posts";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";

// ページのルートパラメータを受け取る
export default async function PostPage({ params }: { params: { id: string } }) {
  // paramsを使用する前に待機する
  const resolvedParams = await params;
  const postId = parseInt(resolvedParams.id);
  
  // Supabaseから記事データを取得
  const post = await getPostById(postId);
  
  // 記事が見つからない場合は404ページを表示
  if (!post) {
    notFound();
  }
  
  return (
    <div className="container mx-auto py-12">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-500 mb-4">
          {new Date(post.created_at).toLocaleDateString('ja-JP')}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="mt-8 prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>
      
      <div className="mt-12 flex justify-between max-w-4xl mx-auto">
        <Button asChild variant="outline">
          <Link href="/posts">記事一覧に戻る</Link>
        </Button>
        <Button asChild>
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </div>
  );
} 