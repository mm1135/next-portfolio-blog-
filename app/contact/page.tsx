"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力検証
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "入力エラー",
        description: "すべての項目を入力してください。",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "送信完了",
          description: data.message || "お問い合わせありがとうございます。折り返しご連絡いたします。",
        });
        
        // フォームをリセット
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        throw new Error(data.error || "送信に失敗しました");
      }
    } catch (error) {
      console.error("送信エラー:", error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "お問い合わせの送信に失敗しました。後ほど再度お試しください。",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">お問い合わせ</h1>
      
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                お名前 <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="山田 太郎"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                メッセージ <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="お問い合わせ内容をご記入ください"
                rows={6}
                required
              />
            </div>
            
            <div className="flex justify-center pt-4">
              <Button 
                type="submit" 
                className="min-w-[200px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "送信中..." : "送信する"}
              </Button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">その他のお問い合わせ方法</h2>
        <p className="mb-6">
          メールでのお問い合わせも受け付けております。
          <br />
          <a 
            href="mailto:mmmm1135biz@gmail.com" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            mmmm1135biz@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
} 