import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mail, User } from 'lucide-react';
import TechIcon from '@/components/common/TechIcon';
import { getRecentPosts } from '@/lib/posts';
import { PostCard } from '@/components/blog/PostCard';
import ProfileImage from '@/components/common/ProfileImage';

export default async function HomePage() {
  // 最近の投稿を取得
  const recentPosts = await getRecentPosts(2);
  
  return (
    <div className="container px-4 mx-auto">
      {/* ヒーローセクション */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 -z-10"></div>
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] -z-10"></div>
        
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-bold text-4xl md:text-6xl tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-400 dark:to-blue-500">
                フルスタック<br />ウェブ開発者
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
                Next.js、React、TypeScriptを駆使して<br className="hidden md:block" />
                モダンでスケーラブルなウェブアプリケーションを開発します
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link 
                  href="/about" 
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg hover:shadow-xl shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                >
                  <User size={18} />
                  プロフィールを見る
                </Link>
                <Link 
                  href="/contact" 
                  className="px-5 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-medium transition-colors border border-gray-200 dark:border-gray-700 flex items-center gap-2"
                >
                  <Mail size={18} />
                  お問い合わせ
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-[280px] md:w-[380px] aspect-square rounded-full bg-indigo-100 dark:bg-indigo-900/20 overflow-hidden mx-auto">
                <ProfileImage />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="text-sm font-medium">開発案件募集中</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 技術スタックセクション */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">使用技術</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { name: 'Next.js', tech: 'nextjs' },
              { name: 'React', tech: 'react' },
              { name: 'TypeScript', tech: 'typescript' },
              { name: 'Tailwind CSS', tech: 'tailwind' },
              { name: 'Supabase', tech: 'supabase' },
              { name: 'Node.js', tech: 'nodejs' },
              { name: 'PostgreSQL', tech: 'postgresql' },
              { name: 'AWS', tech: 'aws' },
            ].map((item, i) => (
              <div 
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group"
              >
                <div className="mb-4 grayscale group-hover:grayscale-0 transition-all group-hover:scale-110">
                  <TechIcon name={item.tech} />
                </div>
                <h3 className="font-medium">{item.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 最近の活動セクション */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl mb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">最近の活動</h2>
            <Link 
              href="/posts" 
              className="group flex items-center gap-2 mt-4 md:mt-0 font-medium text-indigo-600 dark:text-indigo-400"
            >
              すべての記事を見る
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-gray-500">
                まだ記事がありません
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* CTAセクション */}
      <section className="mb-20">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">プロジェクトを一緒に始めましょう</h2>
            <p className="text-xl opacity-90 mb-10 max-w-xl mx-auto">
              新規プロジェクトやウェブサイトの制作をお考えですか？お気軽にご連絡ください。
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-full font-medium transition-colors"
            >
              <Mail size={18} />
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
