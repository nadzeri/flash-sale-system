import { useEffect, useState } from 'react';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    const difference = endTime.getTime() - new Date().getTime();
    
    if (difference > 0) {
      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex gap-4 justify-center">
      <div className="flex flex-col items-center">
        <div className="bg-primary text-primary-foreground rounded-lg p-4 min-w-[80px] text-center">
          <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
        </div>
        <div className="text-sm mt-2 text-muted-foreground">Hours</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-primary text-primary-foreground rounded-lg p-4 min-w-[80px] text-center">
          <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
        </div>
        <div className="text-sm mt-2 text-muted-foreground">Minutes</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-primary text-primary-foreground rounded-lg p-4 min-w-[80px] text-center">
          <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
        </div>
        <div className="text-sm mt-2 text-muted-foreground">Seconds</div>
      </div>
    </div>
  );
}
