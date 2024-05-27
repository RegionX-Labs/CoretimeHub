import { Stack, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

import styles from './index.module.scss';

interface CountDownProps {
  remainingTime: number;
}
export const CountDown = ({ remainingTime }: CountDownProps) => {
  const minuteSeconds = 60;
  const hourSeconds = 3600;
  const daySeconds = 86400;

  const timerProps = {
    isPlaying: true,
    size: 96,
    strokeWidth: 2,
  };

  const theme = useTheme();

  const [daysDuration, setDaysDuration] = useState(0);

  const getTimeSeconds = (time: number) => (minuteSeconds - time) | 0;
  const getTimeMinutes = (time: number) =>
    ((time % hourSeconds) / minuteSeconds) | 0;
  const getTimeHours = (time: number) =>
    ((time % daySeconds) / hourSeconds) | 0;
  const getTimeDays = (time: number) => (time / daySeconds) | 0;
  const renderTime = (dimension: string, time: number) => {
    return (
      <div className={styles.timeElement}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: theme.palette.common.black,
          }}
        >
          {time}
        </Typography>
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: '0.75rem',
            color: theme.palette.text.primary,
          }}
        >
          {dimension}
        </Typography>
      </div>
    );
  };

  useEffect(() => {
    const days = Math.ceil(remainingTime / daySeconds);
    const _daysDuration = days * daySeconds;

    setDaysDuration(_daysDuration);
  }, [remainingTime]);

  return remainingTime <= 0 ? (
    <></>
  ) : (
    <Stack direction='row' gap='0.5rem'>
      <CountdownCircleTimer
        {...timerProps}
        colors='#64A537'
        duration={daysDuration}
        initialRemainingTime={remainingTime}
      >
        {({ elapsedTime, color }) => (
          <span style={{ color }}>
            {renderTime('days', getTimeDays(daysDuration - elapsedTime))}
          </span>
        )}
      </CountdownCircleTimer>
      <CountdownCircleTimer
        {...timerProps}
        colors='#64A537'
        duration={daySeconds}
        initialRemainingTime={remainingTime % daySeconds}
        onComplete={(totalElapsedTime) => ({
          shouldRepeat: remainingTime - totalElapsedTime > hourSeconds,
        })}
      >
        {({ elapsedTime, color }) => (
          <span style={{ color }}>
            {renderTime('hours', getTimeHours(daySeconds - elapsedTime))}
          </span>
        )}
      </CountdownCircleTimer>
      <CountdownCircleTimer
        {...timerProps}
        colors='#64A537'
        duration={hourSeconds}
        initialRemainingTime={remainingTime % hourSeconds}
        onComplete={(totalElapsedTime) => ({
          shouldRepeat: remainingTime - totalElapsedTime > minuteSeconds,
        })}
      >
        {({ elapsedTime, color }) => (
          <span style={{ color }}>
            {renderTime('minutes', getTimeMinutes(hourSeconds - elapsedTime))}
          </span>
        )}
      </CountdownCircleTimer>
      <CountdownCircleTimer
        {...timerProps}
        colors='#64A537'
        duration={minuteSeconds}
        initialRemainingTime={remainingTime % minuteSeconds}
        onComplete={(totalElapsedTime) => ({
          shouldRepeat: remainingTime - totalElapsedTime > 0,
        })}
      >
        {({ elapsedTime, color }) => (
          <span style={{ color }}>
            {renderTime('seconds', getTimeSeconds(elapsedTime))}
          </span>
        )}
      </CountdownCircleTimer>
    </Stack>
  );
};
