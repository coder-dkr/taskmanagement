import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface AnalogClockProps {
  timezone: string;
  city: string;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ timezone, city }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRotation = () => {
    const localTime = new Date(time.toLocaleString('en-US', { timeZone: timezone }));
    const hours = localTime.getHours() % 12;
    const minutes = localTime.getMinutes();
    const seconds = localTime.getSeconds();

    return {
      hours: (hours * 30) + (minutes / 2),
      minutes: minutes * 6,
      seconds: seconds * 6
    };
  };

  const rotation = getRotation();

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-medium mb-2">{city}</h2>
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
          
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="50"
              y1="10"
              x2="50"
              y2="15"
              transform={`rotate(${i * 30} 50 50)`}
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="2"
            />
          ))}

          <line
            x1="50"
            y1="50"
            x2="50"
            y2="25"
            transform={`rotate(${rotation.hours} 50 50)`}
            stroke="black"
            strokeWidth="2"
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="20"
            transform={`rotate(${rotation.minutes} 50 50)`}
            stroke="black"
            strokeWidth="1.5"
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            transform={`rotate(${rotation.seconds} 50 50)`}
            stroke="#ff6b6b"
            strokeWidth="1"
          />
          
          <circle cx="50" cy="50" r="2" fill="black" />
        </svg>
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
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
      <div className="text-center mb-4">
        <div className="flex justify-center items-start space-x-8 mb-6">
          <div className="text-left">
            <AnalogClock timezone="Asia/Jerusalem" city="Israel" />
          </div>
          <div className="text-left">
            <AnalogClock timezone="America/New_York" city="United States" />
          </div>
          <div className="text-left">
            <AnalogClock timezone="Asia/Kolkata" city="India" />
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