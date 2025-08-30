

import React, { useState, useEffect } from 'react';

const calculateTimeLeft = (endDate: Date) => {
    const difference = +endDate - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    return timeLeft;
};

interface CountdownTimerProps {
    endDate: Date;
    t: (key: string) => string;
}

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center bg-surface rounded-lg p-4 w-24 h-24 shadow-inner">
        <span className="text-4xl font-bold text-primary">{String(value).padStart(2, '0')}</span>
        <span className="text-sm uppercase text-foreground-muted">{label}</span>
    </div>
);

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, t }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    <div className="flex flex-col items-center">
        <h3 className="text-2xl font-bold mb-4">{t('presale_ends_in')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <TimeUnit value={timeLeft.days} label={t('time_days')} />
            <TimeUnit value={timeLeft.hours} label={t('time_hours')} />
            <TimeUnit value={timeLeft.minutes} label={t('time_minutes')} />
            <TimeUnit value={timeLeft.seconds} label={t('time_seconds')} />
        </div>
    </div>
  );
};