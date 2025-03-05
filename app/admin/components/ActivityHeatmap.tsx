"use client";

import React, { useEffect, useState } from 'react';

// 1年分のデータを表示
export default function ActivityHeatmap() {
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
        
        setActivityData(activityByDate);
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
    if (count < 2) return 'bg-blue-200 dark:bg-blue-800';
    if (count < 4) return 'bg-blue-300 dark:bg-blue-700';
    if (count < 6) return 'bg-blue-400 dark:bg-blue-600';
    return 'bg-blue-500 dark:bg-blue-500';
  };
  
  if (loading) return (
    <div className="flex justify-center items-center py-6">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600 dark:text-gray-300">活動データを読み込み中...</span>
    </div>
  );
  
  const days = getDaysArray();
  
  return (
    <div className="my-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        活動状況
      </h2>
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
        {days.map(day => (
          <div 
            key={day}
            className={`w-4 h-4 ${getColor(activityData[day] || 0)} rounded-sm hover:ring-1 ring-gray-400 transform hover:scale-125 transition-transform duration-200`}
            title={formatDate(day)}
          />
        ))}
      </div>
      <div className="flex items-center text-xs mt-2 text-gray-500 dark:text-gray-400 justify-end">
        <span>少ない</span>
        <div className="flex mx-1">
          <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 mx-0.5 rounded-sm" />
          <div className="w-3 h-3 bg-blue-200 dark:bg-blue-800 mx-0.5 rounded-sm" />
          <div className="w-3 h-3 bg-blue-300 dark:bg-blue-700 mx-0.5 rounded-sm" />
          <div className="w-3 h-3 bg-blue-400 dark:bg-blue-600 mx-0.5 rounded-sm" />
          <div className="w-3 h-3 bg-blue-500 dark:bg-blue-500 mx-0.5 rounded-sm" />
        </div>
        <span>多い</span>
      </div>
    </div>
  );
} 