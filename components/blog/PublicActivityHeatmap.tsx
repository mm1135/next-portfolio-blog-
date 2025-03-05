"use client";

import React, { useEffect, useState } from 'react';

export default function PublicActivityHeatmap() {
  const [activityData, setActivityData] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      try {
        const response = await fetch(
          `/api/activities?startDate=${oneYearAgo.toISOString()}&endDate=${today.toISOString()}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        
        const data = await response.json();
        const activities = data.activities;
        
        // 日付ごとの活動数をカウント
        const activityByDate: {[key: string]: number} = {};
        activities.forEach((activity: any) => {
          // タイムゾーンを考慮した日付変換 (JSTに変換)
          const date = new Date(activity.created_at);
          const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // UTC+9時間（日本時間）
          const dateKey = jstDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
          activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;
        });
        
        console.log('Activity data:', activityByDate); // デバッグ用
        setActivityData(activityByDate);
        
        // 取得したデータのデバッグ表示
        console.log('Activity dates:', Object.keys(activityByDate));
        console.log('First activity:', activities.length > 0 ? activities[0] : 'No activities');
        
        // 日付のフォーマットをテスト
        const testDate = new Date();
        console.log('Format test:', formatDate(testDate.toISOString().split('T')[0]));
      } catch (error) {
        console.error('活動データの取得に失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  // 日付の配列を生成（過去1年分）
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().split('T')[0]);
    }
    return days;
  };
  
  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    
    return `${year}年${month}月${day}日(${dayOfWeek}): ${activityData[dateString] || 0}件の活動`;
  };
  
  // 活動数に基づいて色を決定
  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (count < 2) return 'bg-emerald-200 dark:bg-emerald-800';
    if (count < 4) return 'bg-emerald-300 dark:bg-emerald-700';
    if (count < 6) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };
  
  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      <span className="ml-3 text-gray-600 dark:text-gray-300">活動データを読み込み中...</span>
    </div>
  );
  
  const days = getDaysArray();
  
  // 週ごとにグループ化（月曜始まりに修正）
  const weeks: string[][] = [];
  let currentWeek: string[] = [];
  
  // 最初の日の曜日を取得 (0=日曜, 1=月曜, ..., 6=土曜)
  const firstDay = new Date(days[0]);
  const dayOfWeek = firstDay.getDay();
  
  // 月曜始まりの配列に変換する場合のオフセット（日本式カレンダー）
  // 日本の場合は日曜始まりが一般的なので、現状のままにします
  // const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  // 最初の週の空白を埋める
  for (let i = 0; i < dayOfWeek; i++) {
    currentWeek.push('');
  }
  
  // 日付を週ごとに振り分け
  days.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });
  
  // 最後の週が7日未満なら残りを空白で埋める
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push('');
    }
    weeks.push(currentWeek);
  }
  
  return (
    <div className="my-4">
      <h2 className="text-xl font-bold mb-6 text-gray-700 dark:text-gray-200 flex items-center">
        <svg className="w-6 h-6 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        投稿活動
      </h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-inner">
        <div className="flex">
          <div className="mr-2 pt-6">
            <div className="flex flex-col h-full justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span>日</span>
              <span>月</span>
              <span>火</span>
              <span>水</span>
              <span>木</span>
              <span>金</span>
              <span>土</span>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="inline-flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div 
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-4 h-4 ${day ? getColor(activityData[day] || 0) : 'bg-transparent'} rounded-sm transform hover:scale-125 transition-transform duration-200 relative group`}
                      data-date={day}
                    >
                      {day && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10">
                          {formatDate(day)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center text-xs mt-4 text-gray-500 dark:text-gray-400 justify-end">
          <span className="mr-1">少ない</span>
          <div className="flex mx-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 mx-0.5 rounded-sm" />
            <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-800 mx-0.5 rounded-sm" />
            <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-700 mx-0.5 rounded-sm" />
            <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-600 mx-0.5 rounded-sm" />
            <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-500 mx-0.5 rounded-sm" />
          </div>
          <span className="ml-1">多い</span>
        </div>
      </div>
    </div>
  );
} 