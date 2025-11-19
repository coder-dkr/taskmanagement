import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface AnalogClockProps {
  timezone: string;
  city: string;
}
const DigitalClock: React.FC<AnalogClockProps> = ({ timezone, city }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getDigitalTime = () => {
    return time.toLocaleString('en-US', { 
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="relative p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl border border-slate-700/50 min-w-[200px] group hover:scale-105 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <h2 className="text-sm font-medium mb-3 text-slate-400 uppercase tracking-wider">{city}</h2>
        <div className="text-4xl font-mono font-bold text-white tracking-tight">
          {getDigitalTime()}
        </div>
      </div>
    </div>
  );
};

export const DateTime = () => {
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-full">
      <div className="text-center mb-4">
        <div className="flex justify-center items-start space-x-6 mb-8">
          <div className="text-left">
            <DigitalClock timezone="Asia/Jerusalem" city="Israel" />
          </div>
          <div className="text-left">
            <DigitalClock timezone="America/New_York" city="New York" />
          </div>
          <div className="text-left">
            <DigitalClock timezone="Asia/Kolkata" city="India" />
          </div>
        </div>
        <p className="text-xl text-gray-600 mt-8">{formatDate(date)}</p>
      </div>

      <div className="border-t pt-4 mt-4">
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

export default DateTime;