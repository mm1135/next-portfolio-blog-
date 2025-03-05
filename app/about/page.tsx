export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">プロフィール</h1>
      
      <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
        {/* プロフィール画像と基本情報 */}
        <div className="space-y-6">
          <div className="w-48 h-48 rounded-full bg-gray-200 mx-auto md:mx-0">
            {/* プロフィール画像を後で追加 */}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">MM1135</h2>
            <p className="text-gray-600">フルスタックエンジニア</p>
            <div className="flex gap-2 mt-4">
              <a href="https://github.com/mm1135" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a>
              <span>|</span>
              <a href="https://qiita.com/mm1135" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Qiita</a>
            </div>
          </div>
        </div>
        
        {/* 詳細プロフィール */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">自己紹介</h2>
            <p className="text-gray-700">
              Next.js、React、TypeScriptなどのモダンなウェブ技術を駆使して、
              使いやすく高パフォーマンスなウェブアプリケーションの開発に取り組んでいます。
              ユーザー体験とコード品質を大切にしながら開発を行っています。
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">技術スタック</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">フロントエンド</h3>
                <ul className="list-disc list-inside text-gray-700">
                  <li>React / Next.js</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS</li>
                  <li>HTML/CSS</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">バックエンド</h3>
                <ul className="list-disc list-inside text-gray-700">
                  <li>Node.js</li>
                  <li>Supabase</li>
                  <li>Firebase</li>
                  <li>RESTful API</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">経歴</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">会社名 / ポジション</h3>
                <p className="text-gray-500">20XX年〜現在</p>
                <p className="text-gray-700">ウェブアプリケーション開発、API設計などを担当</p>
              </div>
              <div>
                <h3 className="font-medium">以前の会社 / ポジション</h3>
                <p className="text-gray-500">20XX年〜20XX年</p>
                <p className="text-gray-700">フロントエンド開発、UI/UXデザインを担当</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 