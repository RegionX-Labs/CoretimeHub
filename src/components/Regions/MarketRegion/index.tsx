import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ApiPromise } from '@polkadot/api';
import clsx from 'clsx';
import { humanizer } from 'humanize-duration';
import TimeAgo from 'javascript-time-ago';
// English.
import en from 'javascript-time-ago/locale/en';
import React, { useCallback, useEffect, useState } from 'react';

import { getBalanceString, timesliceToTimestamp } from '@/utils/functions';

import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { Listing } from '@/models';

import styles from './index.module.scss';

interface MarketRegionProps {
  listing: Listing;
  onPurchase?(_listing: Listing): void;
  bordered?: boolean;
}

export const MarketRegion = ({
  listing,
  bordered = true,
  onPurchase = (): void => {
    /** */
  },
}: MarketRegionProps) => {
  return (
    <>
      {bordered ? (
        <Paper className={clsx(styles.container)}>
          <MarketRegionInner listing={listing} onPurchase={onPurchase} />
        </Paper>
      ) : (
        <div className={clsx(styles.container)}>
          <MarketRegionInner listing={listing} onPurchase={onPurchase} />
        </div>
      )}
    </>
  );
};

interface MarketRegionInnerProps {
  listing: Listing;
  onPurchase(_listing: Listing): void;
}

const MarketRegionInner = ({ listing, onPurchase }: MarketRegionInnerProps) => {
  TimeAgo.addLocale(en);
  // Create formatter (English).
  const timeAgo = new TimeAgo('en-US');

  const formatDuration = humanizer({ units: ['w', 'd', 'h'], round: true });
  const { region, regionCoreOccupancy, regionConsumed } = listing;
  const theme = useTheme();

  const [beginTimestamp, setBeginTimestamp] = useState(0);
  const [endTimestamp, setEndTimestamp] = useState(0);

  const {
    state: { api, apiState, symbol, decimals },
  } = useRelayApi();
  const { timeslicePeriod } = useCoretimeApi();

  // FIXME: network-based block time
  const setTimestamps = useCallback(
    async (api: ApiPromise) => {
      const begin = await timesliceToTimestamp(
        api,
        region.getBegin(),
        timeslicePeriod
      );
      const end = await timesliceToTimestamp(
        api,
        region.getEnd(),
        timeslicePeriod
      );
      setBeginTimestamp(begin);
      setEndTimestamp(end);
    },
    [region, timeslicePeriod]
  );

  useEffect(() => {
    if (!api || apiState !== ApiState.READY) {
      return;
    }

    setTimestamps(api);
  }, [api, apiState, setTimestamps]);

  const progress = [
    {
      label: 'Core Occupancy',
      value: regionCoreOccupancy ?? 0,
      color: 'primary',
    },
    {
      label: 'Consumed',
      value: regionConsumed ?? 0,
      color: 'success',
    },
  ];

  const prices = [
    {
      label: 'Price/timeslice:',
      value: getBalanceString(
        listing.timeslicePrice.toString(),
        decimals,
        symbol
      ),
    },
    {
      label: 'Total:',
      value: getBalanceString(
        listing.currentPrice.toString(),
        decimals,
        symbol
      ),
    },
  ];

  return (
    <Box className={styles.container}>
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Typography
          sx={{
            fontSize: '14px',
            color: theme.palette.common.black,
            fontWeight: 700,
          }}
        >
          {`Core Index: #${region.getCore()}`}
        </Typography>
        <Stack direction='row' alignItems='center' gap='0.5rem' fontSize={14}>
          <AccessTimeIcon />
          {formatDuration(endTimestamp - beginTimestamp)}
        </Stack>
      </Stack>
      <Box className={styles.timeInfo}>
        <Box className={styles.timeItem}>
          <Typography>Begin: </Typography>
          <Typography
            sx={{ color: theme.palette.common.black, fontWeight: 500 }}
          >
            {timeAgo.format(beginTimestamp)}
          </Typography>
        </Box>
        <Box className={styles.timeItem}>
          <Typography>End: </Typography>
          <Typography
            sx={{ color: theme.palette.common.black, fontWeight: 500 }}
          >
            {timeAgo.format(endTimestamp)}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          mt: '1.5rem',
        }}
      >
        {progress.map(({ label, value, color }, index) => (
          <Stack key={index} direction='column' gap='0.5rem'>
            <Stack direction='row' justifyContent='space-between'>
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: 13,
                  color: theme.palette.common.black,
                }}
              >
                {label}
              </Typography>
              <Typography
                variant='h2'
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: theme.palette.common.black,
                }}
              >
                {`${(value * 100).toFixed(2)}%`}
              </Typography>
            </Stack>
            <LinearProgress
              value={value * 100}
              valueBuffer={100}
              sx={{
                width: '20rem',
                height: '0.8rem',
              }}
              variant='buffer'
              color={color as 'success' | 'primary'}
            />
          </Stack>
        ))}
      </Box>
      <Paper
        sx={{
          mt: '2rem',
          padding: '1rem',
        }}
      >
        <Stack direction='row' justifyContent='space-between'>
          {prices.map(({ label, value }, index) => (
            <Box key={index} className={styles.priceItem}>
              <Typography sx={{ color: theme.palette.primary.main }}>
                {label}
              </Typography>
              <Typography
                sx={{ color: theme.palette.common.black, fontWeight: 700 }}
              >
                {value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
      <Box sx={{ marginTop: '1em' }} display='flex' justifyContent='center'>
        <Button
          sx={{
            width: '100%',
            background: theme.palette.primary.contrastText,
            color: theme.palette.primary.main,
            fontSize: '0.75rem',
            borderRadius: '2rem',
            height: '2.5rem',
          }}
          onClick={() => onPurchase(listing)}
        >
          Purchase
        </Button>
      </Box>
    </Box>
  );
};
