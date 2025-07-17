import React, { useState, useEffect } from 'react';
import { Icons } from '../../constants';

const RealTimeClock: React.FC<{isWelcomeBanner?: boolean}> = ({ isWelcomeBanner = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);
  
  const timeFormat: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
  };
  
  if (isWelcomeBanner) {
      return (
        <div className="flex items-center space-x-2 text-sm text-indigo-200 bg-black/20 px-3 py-1.5 rounded-lg">
            <Icons.Clock className="w-5 h-5" />
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, {currentTime.toLocaleTimeString('en-US', timeFormat)}</span>
        </div>
      );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
      <Icons.Clock className="w-5 h-5 text-primary-600" />
      <span>{currentTime.toLocaleTimeString('en-US', { ...timeFormat, second: 'numeric' })}</span>
    </div>
  );
};

export default RealTimeClock;