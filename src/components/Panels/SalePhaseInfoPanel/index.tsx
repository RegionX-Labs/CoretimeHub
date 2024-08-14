import { Box, Button, Paper, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

import { CountDown, PurchaseHistoryModal, SalePhaseCard } from '@/components';

import { useSaleInfo } from '@/contexts/sales';
import { SalePhase } from '@/models';

import styles from './index.module.scss';
export const SalePhaseInfoPanel = () => {
  const theme = useTheme();

  const {
    phase: { currentPhase, currentPrice, endpoints },
  } = useSaleInfo();

  const [remainingTime, setRemainingTime] = useState(0);
  const [historyModalOpen, openHistoryModal] = useState(false);

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
  }, [
    endpoints.interlude.end,
    endpoints.leadin.end,
    endpoints.fixed.end,
    currentPhase,
  ]);

  return (
    <>
      <Paper className={styles.container} data-cy='sale-phase-info'>
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
            onClick={() => openHistoryModal(true)}
            data-cy='btn-purchase-history'
          >
            Purchase History
          </Button>
        </Box>
        <Box className={styles.timerWrapper}>
          <Box className={styles.currentPhase}>
            <SalePhaseCard
              loading={currentPrice === undefined}
              label=''
              value={currentPhase}
            />
          </Box>
          <Typography>Ends in:</Typography>
          <CountDown remainingTime={remainingTime} />
        </Box>
      </Paper>
      <PurchaseHistoryModal
        open={historyModalOpen}
        onClose={() => openHistoryModal(false)}
      />
    </>
  );
};
