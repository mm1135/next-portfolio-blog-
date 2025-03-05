import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPostById } from "@/lib/posts";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Tag, ArrowLeft, Home } from "lucide-react";
import { Metadata } from 'next';

// Next.js 15用にProps型を修正 - paramsはPromise型
type Props = {
  params: Promise<{ id: string }>;
};

// generateMetadata関数の修正
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Promiseとして提供されるparamsを解決
  const resolvedParams = await params;
  const postId = parseInt(resolvedParams.id);
  const post = await getPostById(postId);
  
  if (!post) {
    return {
      title: '記事が見つかりません',
    };
  }
  
  return {
    title: post.title,
    description: post.content.substring(0, 160),
  };
}

// コンポーネント内でもparamsをawaitで解決する
export default async function PostPage({ params }: Props) {
  // Promiseとして提供されるparamsを解決
  const resolvedParams = await params;
  const postId = parseInt(resolvedParams.id);
  const post = await getPostById(postId);
  
  if (!post) {
    notFound();
  }
  
  // 簡易的な読了時間の計算
  const readingTime = Math.ceil(post.content.length / 500);
  
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-4xl mx-auto overflow-hidden shadow-lg">
        <CardHeader className="border-b bg-muted/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon size={14} />
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('ja-JP')}
              </time>
              <span className="px-2">•</span>
              <div className="flex items-center gap-1">
                <span>約{readingTime}分で読めます</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold">{post.title}</h1>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags && post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag size={12} />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-8 pb-6">
          <div className="prose-wrapper dark:prose-invert prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4">
            <MarkdownRenderer content={post.content} />
          </div>
        </CardContent>
        
        <CardFooter className="border-t py-6 flex justify-between flex-wrap gap-4">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/posts">
              <ArrowLeft size={16} />
              記事一覧に戻る
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/">
              <Home size={16} />
              ホームに戻る
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 