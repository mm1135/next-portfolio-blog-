import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();
    
    // 入力検証
    if (!name || !email || !message) {
      return NextResponse.json({ error: '必須項目が入力されていません' }, { status: 400 });
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: 'メールアドレスの形式が正しくありません' }, { status: 400 });
    }
    
    // 1. データベースに保存 - 非同期処理を修正
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    try {
      // データベース保存を試みるが、失敗してもメール送信は続行
      const { error: dbError } = await supabase
        .from('contacts')
        .insert([{ 
          name, 
          email, 
          message, 
          created_at: new Date().toISOString(),
          status: 'unread'
        }]);
        
      if (dbError) {
        console.error('データベース保存エラー:', dbError);
      }
    } catch (dbError) {
      console.error('データベース処理エラー:', dbError);
      // DBエラーでも処理は継続
    }
    
    // 2. メール送信 - Gmail設定の修正
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Gmailのアプリパスワードを使用
      },
    });
    
    // SMTP接続のテスト
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP接続エラー:', verifyError);
      // エラーをスローする代わりに失敗情報を返す
      return NextResponse.json({ 
        error: 'メールサーバーへの接続に失敗しました',
        details: '管理者に連絡してください'
      }, { status: 500 });
    }
    
    // メール送信
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // 管理者（自分）へのメール
      subject: `[お問い合わせ] ${name}様からのメッセージ`,
      text: `
        名前: ${name}
        メールアドレス: ${email}
        
        メッセージ:
        ${message}
      `,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('お問い合わせ処理エラー:', error);
    return NextResponse.json({ error: 'お問い合わせ送信中にエラーが発生しました' }, { status: 500 });
  }
} 