import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  Box,
  Button,
  Divider,
  LinearProgress,
  Paper,
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

import { formatBalance, timesliceToTimestamp } from '@/utils/functions';

import { useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useCommon } from '@/contexts/common';
import { Listing } from '@/models';

import styles from './index.module.scss';

interface ListingCardProps {
  listing: Listing;
  readOnly: boolean;
  onPurchase?(_listing: Listing): void;
  bordered?: boolean;
}

export const ListingCard = ({
  listing,
  readOnly,
  bordered = true,
  onPurchase = (): void => {
    /** */
  },
}: ListingCardProps) => {
  return (
    <>
      {bordered ? (
        <Paper className={clsx(styles.container)}>
          <ListingCardInner
            listing={listing}
            readOnly={readOnly}
            onPurchase={onPurchase}
          />
        </Paper>
      ) : (
        <div className={clsx(styles.container)}>
          <ListingCardInner
            listing={listing}
            readOnly={readOnly}
            onPurchase={onPurchase}
          />
        </div>
      )}
    </>
  );
};

interface ListingCardInnerProps {
  listing: Listing;
  readOnly: boolean;
  onPurchase(_listing: Listing): void;
}

const ListingCardInner = ({
  listing,
  readOnly,
  onPurchase,
}: ListingCardInnerProps) => {
  TimeAgo.addLocale(en);
  // Create formatter (English).
  const timeAgo = new TimeAgo('en-US');

  const formatDuration = humanizer({ units: ['w', 'd', 'h'], round: true });
  const { region, regionCoreOccupancy, regionConsumed } = listing;
  const theme = useTheme();

  const [beginTimestamp, setBeginTimestamp] = useState(0);
  const [endTimestamp, setEndTimestamp] = useState(0);

  const {
    state: { api, apiState },
  } = useRelayApi();
  const { timeslicePeriod } = useCommon();

  const setTimestamps = useCallback(
    (api: ApiPromise) => {
      timesliceToTimestamp(api, region.getBegin(), timeslicePeriod).then(
        (value) => setBeginTimestamp(value)
      );
      timesliceToTimestamp(api, region.getEnd(), timeslicePeriod).then(
        (value) => setEndTimestamp(value)
      );
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
      color: 'warning',
    },
    {
      label: 'Consumed',
      value: regionConsumed ?? 0,
      color: 'success',
    },
  ];
  return (
    <Box className={styles.listingInfo}>
      <Box textAlign={'center'}>
        <Typography
          fontSize={'18px'}
          variant='button'
        >{`Core Index: #${region.getCore()}`}</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          mt: '2rem',
        }}
      >
        {progress.map(({ label, value, color }, index) => (
          <Box
            key={index}
            sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
          >
            <LinearProgress
              value={value * 100}
              valueBuffer={100}
              sx={{
                width: '8rem',
                height: '0.8em',
              }}
              variant='buffer'
              color={color as 'warning' | 'success' | 'info'}
            />
            <Typography
              variant='h2'
              sx={{
                color: theme.palette.text.primary,
                width: '3rem',
                fontWeight: 400,
              }}
            >
              {`${(value * 100).toFixed(2)}%`}
            </Typography>
            <Typography variant='h2' sx={{ fontWeight: 400 }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Divider sx={{ margin: '1em' }} orientation='horizontal' flexItem />
      <div
        className={styles.duration}
        style={{
          borderColor: theme.palette.grey[200],
          color: theme.palette.grey[200],
        }}
      >
        <AccessTimeIcon sx={{ fontSize: '1.25em' }} />
        {`Duration: ${formatDuration(endTimestamp - beginTimestamp)}`}
      </div>
      <Box marginY={'1em'} display={'flex'} justifyContent={'space-between'}>
        <Typography variant='h2'>
          Begin: {timeAgo.format(beginTimestamp)}
        </Typography>
        <Typography variant='h2'>
          End: {timeAgo.format(endTimestamp)}
        </Typography>
      </Box>
      <Box>
        <Box
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Typography fontSize={'1rem'}>Price/timeslice:</Typography>
          <Typography variant='h2'>
            {formatBalance(listing.timeslicePrice.toString(), true)} ROC
          </Typography>
        </Box>
        <Box
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Typography fontSize={'1rem'}>Total:</Typography>
          <Typography variant='h2'>
            {formatBalance(listing.currentPrice.toString(), true)} ROC
          </Typography>
        </Box>
      </Box>
      {!readOnly && (
        <Box
          sx={{ marginTop: '1em' }}
          display={'flex'}
          justifyContent={'center'}
        >
          <Button
            sx={{ width: '100%' }}
            variant='outlined'
            onClick={() => onPurchase(listing)}
          >
            Purchase
          </Button>
        </Box>
      )}
    </Box>
  );
};
