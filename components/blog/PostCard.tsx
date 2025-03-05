"use client";

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Post } from '@/types/post';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, Tag } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

type PostCardProps = {
  post: Post;
  className?: string;
};

export function PostCard({ post, className = '' }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`} className="block h-full">
      <Card className={`h-full hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden ${className}`}>
        <CardHeader className="pt-4 pb-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(post.publishedAt)}
          </div>
          <h3 className="text-xl font-semibold line-clamp-2">{post.title}</h3>
        </CardHeader>
        
        <CardContent className="pb-2">
          <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
            {post.excerpt || post.content.substring(0, 150)}...
          </p>
        </CardContent>
        
        <CardFooter className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            {post.categories && post.categories.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Tag size={12} />
                {post.categories[0]}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{post.readingTime || '3分'}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 