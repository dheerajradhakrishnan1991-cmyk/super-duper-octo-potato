export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
  isUrgent: boolean; // < 1 hour remaining
  formattedShort: string;
}

export function getTimeRemaining(targetTimestamp: number, currentTimestamp = Date.now()): TimeRemaining {
  const totalMs = targetTimestamp - currentTimestamp;

  if (totalMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isExpired: true,
      isUrgent: false,
      formattedShort: 'Draw in progress',
    };
  }

  const totalSeconds = Math.floor(totalMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  const pad = (n: number) => n.toString().padStart(2, '0');

  let formattedShort = '';
  if (days > 0) {
    formattedShort = `${days}d ${pad(hours)}h ${pad(minutes)}m`;
  } else if (hours > 0) {
    formattedShort = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  } else {
    formattedShort = `${pad(minutes)}m ${pad(seconds)}s`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs,
    isExpired: false,
    isUrgent: totalMs < 60 * 60 * 1000, // less than 1 hour
    formattedShort,
  };
}
