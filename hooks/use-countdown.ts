import { useState, useEffect } from 'react';

export function useCountdown(initialSeconds: number, autoStart = false) {
  const [remainingTime, setRemainingTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (!isRunning || remainingTime <= 0) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remainingTime]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = (newTime?: number) => {
    setRemainingTime(newTime ?? initialSeconds);
    setIsRunning(false);
  };

  return {
    remainingTime,
    isRunning,
    start,
    stop,
    reset,
  };
}
