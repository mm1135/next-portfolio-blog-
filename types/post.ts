export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  publishedAt: string;
  categories?: string[];
  readingTime?: string;
}; 