"use client";

import React, { useEffect, useState, useCallback } from 'react';

interface ActivityHeatmapProps {
  isAdmin?: boolean; // 管理者用表示かどうか
  userId?: string;   // 特定ユーザーの活動を表示する場合に使用
}

export default function ActivityHeatmap({ isAdmin = false, userId }: ActivityHeatmapProps) {
  const [activityData, setActivityData] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  // 現在の年月をデフォルト値として設定
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // JavaScriptの月は0から始まるため+1
  
  // fetchActivities関数をuseCallback内で定義して再利用可能に
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const debugMessages: string[] = [];
    
    // 選択された年月に基づいて日付範囲を設定 - 前後の月も含める
    const startDate = new Date(selectedYear, selectedMonth - 2, 1); // 前月の1日から
    const endDate = new Date(selectedYear, selectedMonth + 1, 0); // 翌月の末日まで
    
    debugMessages.push(`📅 取得期間: ${startDate.toISOString()} から ${endDate.toISOString()}`);
    
    try {
      // ユーザーIDが指定されている場合はクエリパラメータに追加
      let apiUrl = `/api/activities?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      if (userId) {
        apiUrl += `&userId=${userId}`;
      }
      
      debugMessages.push(`🔍 API URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('活動データの取得に失敗しました');
      }
      
      const data = await response.json();
      const activities = data.activities;
      
      debugMessages.push(`📊 取得したアクティビティ数: ${activities.length}`);
      
      // 日付ごとの公開記事数をカウント
      const activityByDate: {[key: string]: number} = {};
      
      activities.forEach((activity: any) => {
        // タイムゾーンを考慮した日付変換
        const date = new Date(activity.created_at);
        
        // 日本時間に調整
        const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
        const dateKey = jstDate.toISOString().split('T')[0];
        
        // デバッグ情報 - 利用可能なフィールドのみ表示
        if (activities.length < 20) {
          debugMessages.push(`🔖 ${activity.id}: ${date.toISOString()} → ${dateKey}`);
        }
        
        activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;
      });
      
      // アクティビティがある日付をデバッグ表示
      const activeDays = Object.keys(activityByDate).sort();
      debugMessages.push(`📆 アクティビティがある日付: ${activeDays.length}件`);
      activeDays.forEach(day => {
        debugMessages.push(`📝 ${day}: ${activityByDate[day]}件`);
      });
      
      setActivityData(activityByDate);
      setDebugInfo(debugMessages);
    } catch (error) {
      console.error('活動データの取得に失敗:', error);
      debugMessages.push(`❌ エラー: ${error}`);
      setDebugInfo(debugMessages);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedYear, selectedMonth]); // 依存配列にuseStateの変数を含める
  
  // コンポーネントマウント時とパラメータ変更時に実行
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]); // fetchActivitiesを依存配列に含める
  
  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };
  
  // アクティビティの数に基づいて色を決定
  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-800 hover:bg-emerald-300 dark:hover:bg-emerald-700';
    if (count === 2) return 'bg-emerald-300 dark:bg-emerald-700 hover:bg-emerald-400 dark:hover:bg-emerald-600';
    if (count === 3) return 'bg-emerald-400 dark:bg-emerald-600 hover:bg-emerald-500 dark:hover:bg-emerald-500';
    return 'bg-emerald-500 dark:bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400';
  };
  
  // 選択された年月に基づいて日付の配列を作成
  const getDaysArray = () => {
    // 選択された年月の最初の日
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    // 選択された年月の最後の日
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    
    // 月の最初の日の曜日に合わせて調整（カレンダー表示のため）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // 月の最後の日の曜日に合わせて調整（カレンダー表示のため）
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    // カレンダー表示用の2次元配列を作成
    const days = [];
    let week = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      week.push(dateString);
      
      currentDate.setDate(currentDate.getDate() + 1);
      
      // 週の終わり（土曜日）または最後の日に達したら、週を配列に追加
      if (currentDate.getDay() === 0 || currentDate > endDate) {
        days.push(week);
        week = [];
      }
    }
    
    return days;
  };
  
  // 現在日かどうかを確認する関数
  const isToday = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    
    return date.getTime() === today.getTime();
  };
  
  // 年の選択肢を生成（今年から5年前まで）
  const years = [];
  for (let i = currentDate.getFullYear() + 1; i >= currentDate.getFullYear() - 5; i--) {
    years.push(i);
  }
  
  // 月の選択肢を生成
  const months = [];
  for (let i = 1; i <= 12; i++) {
    months.push(i);
  }
  
  const days = getDaysArray();
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-36 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      </div>
    );
  }
  
  // 活動データがある日付を特定（特に対象の日付）
  const targetDate = `2025-03-05`;
  const hasTargetActivity = activityData[targetDate] > 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {isAdmin ? "活動状況" : "投稿活動"}
          {hasTargetActivity && <span className="ml-2 text-green-500">✓</span>}
        </h3>
        
        {/* 年月選択UI */}
        <div className="flex space-x-2">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-2 py-1 border rounded text-sm bg-white dark:bg-gray-700 dark:text-white"
          >
            {years.map((year) => (
              <option key={`year-${year}`} value={year}>{year}年</option>
            ))}
          </select>
          
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-2 py-1 border rounded text-sm bg-white dark:bg-gray-700 dark:text-white"
          >
            {months.map((month) => (
              <option key={`month-${month}`} value={month}>{month}月</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center font-medium text-gray-600 dark:text-gray-300">
          <div className="text-red-500 dark:text-red-400">日</div>
          <div>月</div>
          <div>火</div>
          <div>水</div>
          <div>木</div>
          <div>金</div>
          <div className="text-blue-500 dark:text-blue-400">土</div>
        </div>
        
        {/* カレンダー本体 */}
        <div className="grid gap-2">
          {days.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => {
                // 当月の日付かどうかを確認
                const dayDate = new Date(day);
                const isCurrentMonth = dayDate.getMonth() === selectedMonth - 1;
                const isTodayDate = isToday(day);
                const activityCount = activityData[day] || 0;
                
                // 特定の日付（3/5）かどうかをチェック
                const isSpecialDate = day === targetDate;
                
                return (
                  <div 
                    key={`${weekIndex}-${dayIndex}`}
                    className={`
                      relative w-10 h-10 flex items-center justify-center
                      ${isCurrentMonth 
                          ? getColor(activityCount) 
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600'}
                      ${isTodayDate 
                          ? 'ring-2 ring-blue-500 dark:ring-blue-400' 
                          : ''}
                      ${isSpecialDate 
                          ? 'ring-2 ring-pink-500 dark:ring-pink-400' 
                          : ''}
                      rounded-md cursor-pointer transition-all duration-200
                      shadow-sm hover:shadow
                    `}
                    title={`${formatDate(day)}: ${activityCount}件の公開記事`}
                  >
                    {/* 日付の数字 */}
                    <span className={`
                      text-sm font-medium
                      ${isCurrentMonth 
                          ? (dayIndex === 0 ? 'text-red-600 dark:text-red-400' : 
                             dayIndex === 6 ? 'text-blue-600 dark:text-blue-400' : 
                             'text-gray-700 dark:text-gray-200') 
                          : 'text-gray-400 dark:text-gray-600'}
                    `}>
                      {dayDate.getDate()}
                    </span>
                    
                    {/* 記事数バッジ */}
                    {isCurrentMonth && activityCount > 0 && (
                      <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {activityCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* 凡例 */}
      <div className="flex items-center text-xs mt-4 text-gray-600 dark:text-gray-300 justify-end gap-2">
        <span>投稿記事数：</span>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-sm mr-1" />
          <span>0</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-emerald-200 dark:bg-emerald-800 rounded-sm mr-1" />
          <span>1</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-emerald-300 dark:bg-emerald-700 rounded-sm mr-1" />
          <span>2</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-emerald-400 dark:bg-emerald-600 rounded-sm mr-1" />
          <span>3</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-emerald-500 dark:bg-emerald-500 rounded-sm mr-1" />
          <span>4+</span>
        </div>
      </div>
      
      {/* 開発者向け情報（管理者画面のみ表示） */}
      {isAdmin && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-mono overflow-x-auto">
          <h4 className="text-sm font-bold mb-2">デバッグ情報</h4>
          <div className="mb-3">
            <button 
              onClick={() => fetchActivities()} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
              データ再取得
            </button>
          </div>
          <pre>
            {debugInfo.map((line, index) => (
              <div key={index} className="mb-1">{line}</div>
            ))}
            
            {/* 対象日のデータ確認 */}
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900 rounded border border-yellow-200 dark:border-yellow-800">
              <div>🎯 チェック対象: {targetDate}</div>
              <div>📝 投稿数: {activityData[targetDate] || 0}</div>
              <div>✅ 状態: {hasTargetActivity ? '表示されています' : '表示されていません'}</div>
            </div>
          </pre>
        </div>
      )}
    </div>
  );
} 