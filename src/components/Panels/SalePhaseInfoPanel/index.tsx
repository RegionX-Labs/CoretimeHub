import { Box, Button, Paper, Typography, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { CountDown, SalePhaseCard } from '@/components/Elements';

import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';
import { SalePhase } from '@/models';

import styles from './index.module.scss';
export const SalePhaseInfoPanel = () => {
  const theme = useTheme();
  const router = useRouter();
  const { network } = useNetwork();

  const {
    phase: { currentPhase, endpoints },
  } = useSaleInfo();

  const [remainingTime, setRemainingTime] = useState(0);

  const valEndpoints = JSON.stringify(endpoints);

  const onManage = () => {
    router.push({
      pathname: '/regions',
      query: { network },
    });
  };

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

    setRemainingTime(_remainingTime);
  }, [valEndpoints, currentPhase]);

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
        <Box className={styles.currentPhase}>
          <SalePhaseCard label='' value={currentPhase} />
        </Box>
        <Typography>Ends in:</Typography>
        <CountDown remainingTime={remainingTime} />
      </Box>
    </Paper>
  );
};
