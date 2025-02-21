import React, { useState, useEffect } from 'react';

export const DateTime = () => {
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCalendarDays = (): { days: number[]; firstDay: number; today: number } => {
    const today = date.getDate();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    
    const days = [];
    for (let i = 1; i <= lastDay; i++) {
      days.push(i);
    }
    
    return { days, firstDay, today };
  };

  const { days, firstDay, today } = getCalendarDays();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
      <div className="text-center mb-4">
        <h2 className="text-4xl font-bold text-gray-800">{formatTime(date)}</h2>
        <p className="text-lg text-gray-600 mt-2">{formatDate(date)}</p>
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="font-medium text-gray-600">{day}</div>
          ))}
          
          {[...Array(firstDay)].map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          
          {days.map((day) => (
            <div
              key={day}
              className={`p-1 ${
                day === today
                  ? 'bg-blue-500 text-white rounded-full'
                  : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};