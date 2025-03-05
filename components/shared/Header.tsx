"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 pl-2 sm:pl-4">
            <Link href="/" className="font-bold text-xl">
              ポートフォリオサイト
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              ホーム
            </Link>
            <Link href="/posts" className="text-sm font-medium hover:underline underline-offset-4">
              記事一覧
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
              プロフィール
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4">
              お問い合わせ
            </Link>
          </nav>
          
          <div className="flex items-center gap-4 pr-2 sm:pr-4">
            <Button variant="outline" size="sm" asChild className="hidden md:flex">
              <a href="https://github.com/mm1135" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </Button>
            
            <Button size="sm" asChild className="hidden md:flex">
              <a href="https://qiita.com/mm1135" target="_blank" rel="noopener noreferrer">
                Qiita
              </a>
            </Button>
            
            {/* モバイルメニューボタン */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </header>
      
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </>
  );
} 