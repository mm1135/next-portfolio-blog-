"use client";

import { User } from 'lucide-react';

export default function ProfileImage() {
  return (
    <div className="bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-800 rounded-full w-full h-full flex items-center justify-center">
      <User className="w-1/2 h-1/2 text-indigo-500 dark:text-indigo-300" />
    </div>
  );
} 