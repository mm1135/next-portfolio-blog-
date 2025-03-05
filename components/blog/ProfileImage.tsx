"use client";

import { useState } from 'react';
import Image from 'next/image';

interface ProfileImageProps {
  src?: string;
  alt: string;
  size?: number;
}

export default function ProfileImage({ src, alt, size = 128 }: ProfileImageProps) {
  // Next.jsの公開ディレクトリにデフォルトのプレースホルダー画像がない場合は
  // 外部のサービスを使用
  const defaultImage = "https://ui-avatars.com/api/?name=" + encodeURIComponent(alt) + "&background=random&color=fff&size=128";
  const [imgSrc, setImgSrc] = useState(src || defaultImage);
  
  return (
    <div className="relative rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg" style={{ width: size, height: size }}>
      {/* 外部画像を使用する場合はnext/imageではなくimg要素を使用 */}
      <img 
        src={imgSrc}
        alt={alt}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        onError={() => setImgSrc(defaultImage)}
      />
    </div>
  );
} 