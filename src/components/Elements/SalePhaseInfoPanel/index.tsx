import { Box, Button, Paper, Typography, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

import { PhaseEndpoints } from '@/hooks/salePhase';

import { SalePhase } from '@/models';

import styles from './index.module.scss';

interface SalePhaseInfoPanelProps {
  currentPhase: string;
  saleEndTimestamp: number;
  saleStartTimestamp: number;
  endpoints: PhaseEndpoints;
}

export const SalePhaseInfoPanel = ({
  currentPhase,
  endpoints,
}: SalePhaseInfoPanelProps) => {
  const theme = useTheme();
  const router = useRouter();

  const onManage = () => {
    router.push({
      pathname: '/regions',
      query: { ...router.query },
    });
  };
  const minuteSeconds = 60;
  const hourSeconds = 3600;
  const daySeconds = 86400;

  const [remainingTime, setRemainingTime] = useState(0);
  const [daysDuration, setDaysDuration] = useState(0);

  useEffect(() => {
    let _remainingTime;
    if (currentPhase == SalePhase.Interlude) {
      _remainingTime = Math.floor(
        (endpoints.interlude.end - Date.now()) / 1000
      );
    } else if (currentPhase == SalePhase.Leadin) {
      _remainingTime = Math.floor((endpoints.leadin.end - Date.now()) / 1000);
    } else if (currentPhase == SalePhase.Regular) {
      _remainingTime = Math.floor((endpoints.fixed.end - Date.now()) / 1000);
    } else return;

    const days = Math.ceil(_remainingTime / daySeconds);
    const _daysDuration = days * daySeconds;

    setDaysDuration(_daysDuration);
    setRemainingTime(_remainingTime);
  }, [endpoints, currentPhase]);

  const timerProps = {
    isPlaying: true,
    size: 96,
    strokeWidth: 2,
  };

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

  const getTimeSeconds = (time: number) => (minuteSeconds - time) | 0;
  const getTimeMinutes = (time: number) =>
    ((time % hourSeconds) / minuteSeconds) | 0;
  const getTimeHours = (time: number) =>
    ((time % daySeconds) / hourSeconds) | 0;
  const getTimeDays = (time: number) => (time / daySeconds) | 0;

  if (remainingTime <= 0) return <></>;

  return (
    <Paper className={styles.container}>
      <Box className={styles.titleWrapper}>
        <Typography
          sx={{
            color: theme.palette.common.black,
            fontSize: '1rem',
            fontWeight: 700,
          }}
        >
          Current Phase
        </Typography>

        <Button
          size='small'
          variant='text'
          className={styles.buttonWrapper}
          sx={{
            background: '#e8eff7',
            color: theme.palette.text.secondary,
          }}
          onClick={onManage}
        >
          Manage your regions
        </Button>
      </Box>
      <Box className={styles.timerWrapper}>
        <Typography className={styles.currentPhase}>{currentPhase}</Typography>
        <Typography>Ends in:</Typography>
        <Box className={styles.countDown}>
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
                {renderTime(
                  'minutes',
                  getTimeMinutes(hourSeconds - elapsedTime)
                )}
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
        </Box>
      </Box>
    </Paper>
  );
};
