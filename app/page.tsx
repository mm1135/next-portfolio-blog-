import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="text-4xl font-bold">マイポートフォリオサイト</h1>
        <p className="text-xl text-center max-w-lg">
          私のスキルや実績、技術記事をまとめたポートフォリオサイトです。
          Next.js、Supabase、Tailwind CSSを使用して構築しています。
        </p>
        
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/posts">記事一覧</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/about">プロフィール</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
