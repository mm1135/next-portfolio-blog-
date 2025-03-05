import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import Providers from './providers';

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
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
