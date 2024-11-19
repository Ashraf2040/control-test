"use client";

import React, { useEffect, useState } from 'react';

interface CountdownProps {
  targetDate: string; // ISO 8601 string format, like '2024-12-31T23:59:59Z'
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const current = new Date().getTime();
      const remainingTime = target - current;

      setTimeLeft(remainingTime);

      // If the countdown is over, clear the interval
      if (remainingTime <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [targetDate]);

  const formatTime = (time: number) => {
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
    };
  };

  const { hours, minutes, seconds , days} = formatTime(timeLeft);

  return (
    <div className='text-md md:text-2xl'>
      
      <div>
        {days < 10 ? `0${days}` : days}:
        {hours < 10 ? `0${hours}` : hours}:{minutes < 10 ? `0${minutes}` : minutes}:
        {seconds < 10 ? `0${seconds}` : seconds}
      </div>
    </div>
  );
};

export default Countdown;
