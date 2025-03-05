import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import Providers from './providers';
import { ToastProvider } from '@/components/ui/use-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ポートフォリオサイト",
  description: "Next.js、Supabase、Tailwind CSSで構築したポートフォリオサイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ToastProvider>
          <Providers>
            <Header />
            {children}
          </Providers>
        </ToastProvider>
      </body>
    </html>
  );
}
