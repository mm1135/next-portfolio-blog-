"use client";

import { useState, createContext, useContext } from 'react';

type ToastType = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

type ToastContextType = {
  toast: (props: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastType & { id: number })[]>([]);
  
  const addToast = (toast: ToastType) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }]);
    
    // 自動的に消えるように
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 5000);
  };
  
  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg shadow-lg p-4 max-w-sm transform transition-all ${
              toast.variant === 'destructive' 
                ? 'bg-red-500 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            }`}
          >
            <h4 className="font-semibold">{toast.title}</h4>
            {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 