import Link from "next/link";
import LogoutButton from "./components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middlewareで認証チェックを行うため、ここでのチェックは不要になりました
  return (
    <div>
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold">
            ブログ管理システム
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
} 