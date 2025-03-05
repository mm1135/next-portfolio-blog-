/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.dicebear.com'], // DiceBearのドメインを許可
  },
  eslint: {
    // 警告をエラーとして扱わない（ビルドを止めない）
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 