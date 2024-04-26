import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import { ApiPromise } from '@polkadot/api';
import { humanizer } from 'humanize-duration';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useCallback, useEffect, useState } from 'react';

import { timesliceToTimestamp } from '@/utils/functions';

import { useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useCommon } from '@/contexts/common';
import { RegionMetadata } from '@/models';

import styles from './index.module.scss';

interface SimpleRegionCardProps {
  regionMetadata: RegionMetadata;
}

export const SimpleRegionCard = ({ regionMetadata }: SimpleRegionCardProps) => {
  TimeAgo.addLocale(en);
  // Create formatter (English).
  const timeAgo = new TimeAgo('en-US');

  const formatDuration = humanizer({ units: ['w', 'd', 'h'], round: true });

  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();

  const theme = useTheme();

  const [beginTimestamp, setBeginTimestamp] = useState(0);
  const [endTimestamp, setEndTimestamp] = useState(0);

  const { region } = regionMetadata;
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
    if (!relayApi || relayApiState !== ApiState.READY) {
      return;
    }

    setTimestamps(relayApi);
  }, [relayApi, relayApiState, setTimestamps]);
  return (
    <Paper className={styles.container}>
      <Box className={styles.regionInfo}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            {regionMetadata.name}
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            {`Duration: ${formatDuration(endTimestamp - beginTimestamp)}`}
          </Typography>
        </Box>
        <Box>
          <Typography
            sx={{ color: theme.palette.common.black }}
          >{`Core Index: #${region.getCore()}`}</Typography>
        </Box>
      </Box>
      <Box className={styles.timeInfo}>
        <Stack direction='column'>
          <Typography>Begin:</Typography>
          <Typography sx={{ color: theme.palette.common.black }}>
            {timeAgo.format(beginTimestamp)}
          </Typography>
        </Stack>
        <Stack direction='column'>
          <Typography>End:</Typography>
          <Typography sx={{ color: theme.palette.common.black }}>
            {timeAgo.format(endTimestamp)}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};
