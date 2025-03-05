"use client";

import { ReactNode } from 'react';
import { 
  Code, Server, Database, Cloud, Layers, LayoutGrid, FileJson
} from 'lucide-react';

// アイコンマッピング - すでにインストール済みのlucide-reactを使用
const iconMap: Record<string, ReactNode> = {
  'nextjs': <Layers size={48} />,
  'react': <Code size={48} />,
  'typescript': <FileJson size={48} />,
  'tailwind': <LayoutGrid size={48} />,
  'supabase': <Database size={48} />,
  'nodejs': <Server size={48} />,
  'postgresql': <Database size={48} />,
  'aws': <Cloud size={48} />
};

type TechIconProps = {
  name: string;
  className?: string;
};

export default function TechIcon({ name, className = "" }: TechIconProps) {
  // アイコンがない場合は空のdivを返す
  if (!iconMap[name.toLowerCase()]) {
    console.warn(`Icon not found for: ${name}`);
    return <div className={`w-12 h-12 ${className}`} />;
  }
  
  return (
    <div className={`text-gray-700 dark:text-gray-300 ${className}`}>
      {iconMap[name.toLowerCase()]}
    </div>
  );
} 