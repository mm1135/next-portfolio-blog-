import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllPosts, Post } from "@/lib/posts";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Tag, ArrowRight } from "lucide-react";

// このページはサーバーコンポーネントですので、クライアントに送信されるJSは最小限
export default async function PostsPage() {
  // Supabaseから記事データを取得
  const posts = await getAllPosts();
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">記事一覧</h1>
      
      {posts.length === 0 ? (
        <p className="text-gray-500 text-center">現在記事はありません。</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <CalendarIcon size={14} />
                  <time dateTime={post.created_at}>
                    {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  </time>
                </div>
                <h2 className="text-xl font-semibold line-clamp-2">
                  <Link href={`/posts/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
              </CardHeader>
              
              <CardContent className="pb-4 flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags && post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Tag size={12} />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-muted-foreground line-clamp-3 mt-3">
                  {post.content.substring(0, 150)}...
                </p>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button asChild variant="outline" className="w-full group">
                  <Link href={`/posts/${post.id}`} className="flex items-center justify-center gap-2">
                    記事を読む
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="flex justify-center mt-12">
        <Button asChild>
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </div>
  );
} 