import { Box, Typography } from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import React, { useEffect, useState } from 'react';

import { formatBalance, getBlockTimestamp } from '@/utils/functions';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { SaleInfo, SalePhase } from '@/models';

import styles from './index.module.scss';

interface SaleInfoGridProps {
  saleInfo: SaleInfo;
  currentPhase: SalePhase;
  currentPrice: number;
  saleEnd: number;
}

const SaleInfoGrid = ({
  saleInfo,
  currentPhase,
  currentPrice,
  saleEnd,
}: SaleInfoGridProps) => {
  TimeAgo.addLocale(en);
  const timeAgo = new TimeAgo('en-US');

  const [saleStartTimestamp, setSaleStartTimestamp] = useState(0);
  const [saleEndTimestamp, setSaleEndTimestamp] = useState(0);
  const {
    state: { api, apiState },
  } = useCoretimeApi();

  const nextPhase = (): SalePhase => {
    const phases = Object.values(SalePhase);
    const currentIndex = phases.indexOf(currentPhase);

    // Calculate the index of the next phase
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex];
  };

  useEffect(() => {
    if (!api || apiState !== ApiState.READY) {
      return;
    }

    getBlockTimestamp(api, saleInfo.saleStart).then((value) =>
      setSaleStartTimestamp(value)
    );
    getBlockTimestamp(api, saleEnd).then((value) => setSaleEndTimestamp(value));
  }, [api, apiState, saleEnd]);

  return (
    <Box className={styles.grid}>
      <Box className={styles.gridItem}>
        <Typography variant='h6'>
          {`Sale start: ${timeAgo.format(saleStartTimestamp)}`}
        </Typography>
        <Typography>
          {`Sale ends ${timeAgo.format(saleEndTimestamp)}`}
        </Typography>
      </Box>
      <Box className={styles.gridItem}>
        <Typography variant='h6'>{`Current phase: ${currentPhase}`}</Typography>
        <Typography>{`Upcoming phase: ${nextPhase()}`}</Typography>
      </Box>
      <Box className={styles.gridItem}>
        <Typography variant='h6'>
          {`Current price: ${formatBalance(currentPrice)}`} ROC
        </Typography>
        <Typography>
          {`Floor price: ${formatBalance(saleInfo.price)}`} ROC
        </Typography>
      </Box>
      <Box>
        <Box>
          <Typography variant='h6'>
            {`Cores offered: ${saleInfo.coresOffered}`}
          </Typography>
          <Typography>Number of cores which are offered for sale.</Typography>
        </Box>
      </Box>
      <Box>
        <Box>
          <Typography variant='h6'>
            {`Cores sold: ${saleInfo.coresSold}`}
          </Typography>
          <Typography>Number of cores which have been sold</Typography>
        </Box>
      </Box>
      <Box>
        <Box>
          <Typography variant='h6'>
            {`Ideal cores sold: ${saleInfo.idealCoresSold}`}
          </Typography>
          <Typography>
            Number of cores sold to not affect the price for next sale
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SaleInfoGrid;
