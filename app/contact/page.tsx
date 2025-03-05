"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);
    
    // お問い合わせ送信のシミュレーション
    try {
      // 実際にはここでAPIを呼び出す
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitResult({
        success: true,
        message: "お問い合わせを受け付けました。近日中にご連絡いたします。"
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setSubmitResult({
        success: false,
        message: "送信に失敗しました。時間をおいて再度お試しください。"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">お問い合わせ</h1>
      
      <div className="max-w-2xl mx-auto">
        <p className="text-gray-700 mb-8">
          お仕事のご依頼、ご質問などがございましたら、下記フォームよりお気軽にお問い合わせください。
        </p>
        
        {submitResult && (
          <div className={`p-4 mb-6 rounded ${submitResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {submitResult.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">お名前</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">メッセージ</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? "送信中..." : "送信する"}
          </Button>
        </form>
      </div>
    </div>
  );
} 