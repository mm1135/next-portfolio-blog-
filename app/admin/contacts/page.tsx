"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

type Contact = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const supabase = useSupabaseClient();
  const router = useRouter();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('お問い合わせデータの取得に失敗:', error);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/admin/login');
      } else {
        fetchContacts();
      }
    };
    
    checkSession();
  }, [supabase, router, fetchContacts]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('contacts')
      .update({ status: 'read' })
      .eq('id', id);
    
    if (error) {
      console.error('ステータス更新エラー:', error);
    } else {
      // 選択されているコンタクトを更新
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact({ ...selectedContact, status: 'read' });
      }
      
      // コンタクトリストを更新
      setContacts(contacts.map(contact => 
        contact.id === id ? { ...contact, status: 'read' } : contact
      ));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP');
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">お問い合わせ管理</h1>
      
      {loading ? (
        <div className="text-center py-12">読み込み中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold mb-4">お問い合わせ一覧</h2>
            
            {contacts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">お問い合わせはありません</p>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedContact?.id === contact.id 
                        ? 'bg-blue-50 dark:bg-blue-900' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{contact.name}</h3>
                      <Badge variant={contact.status === 'unread' ? 'destructive' : 'outline'}>
                        {contact.status === 'unread' ? '未読' : '既読'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(contact.created_at)}
                    </p>
                    <p className="text-sm truncate mt-1">{contact.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            {selectedContact ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">問い合わせ詳細</h2>
                  {selectedContact.status === 'unread' && (
                    <Button onClick={() => markAsRead(selectedContact.id)} variant="outline" size="sm">
                      既読にする
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">お名前</h3>
                    <p className="mt-1">{selectedContact.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">メールアドレス</h3>
                    <p className="mt-1">
                      <a 
                        href={`mailto:${selectedContact.email}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {selectedContact.email}
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">日時</h3>
                    <p className="mt-1">{formatDate(selectedContact.created_at)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">メッセージ</h3>
                    <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg whitespace-pre-line">
                      {selectedContact.message}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      variant="default"
                      onClick={() => window.open(`mailto:${selectedContact.email}?subject=Re: お問い合わせありがとうございます&body=お問い合わせいただきありがとうございます。%0D%0A%0D%0A`)}
                    >
                      返信する
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                左側のリストからお問い合わせを選択してください
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 