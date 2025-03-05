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
    try {
      // cookiesを正しく扱う
      const cookieStore = cookies();
      const supabase = createServerComponentClient({ 
        cookies: () => cookieStore 
      });
      
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
    
    // 2. メール送信処理
    // ユーザーとパスワードを再確認
    console.log('Using email:', process.env.EMAIL_USER ? 'Set correctly' : 'MISSING');
    console.log('App password length:', process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.length : 'MISSING');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      }
    });
    
    // SMTP接続テスト
    try {
      await transporter.verify();
      console.log('SMTP接続成功!');
    } catch (verifyError) {
      console.error('SMTP接続エラー詳細:', verifyError);
      return NextResponse.json({ 
        error: 'メールサーバー接続エラー', 
        details: '管理者にお問い合わせください' 
      }, { status: 500 });
    }
    
    // メール送信
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
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