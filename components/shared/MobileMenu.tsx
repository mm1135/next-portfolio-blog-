"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background md:hidden">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl" onClick={onClose}>
            ポートフォリオサイト
          </Link>
        </div>
        
        <Button variant="ghost" size="icon" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </Button>
      </div>
      
      <nav className="container mt-8 flex flex-col gap-6">
        <Link href="/" className="text-lg font-medium" onClick={onClose}>
          ホーム
        </Link>
        <Link href="/posts" className="text-lg font-medium" onClick={onClose}>
          記事一覧
        </Link>
        <Link href="/about" className="text-lg font-medium" onClick={onClose}>
          プロフィール
        </Link>
        <Link href="/contact" className="text-lg font-medium" onClick={onClose}>
          お問い合わせ
        </Link>
        
        <div className="mt-8 flex flex-col gap-4">
          <Button variant="outline" asChild>
            <a href="https://github.com/mm1135" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </Button>
          
          <Button asChild>
            <a href="https://qiita.com/mm1135" target="_blank" rel="noopener noreferrer">
              Qiita
            </a>
          </Button>
        </div>
      </nav>
    </div>
  );
} 