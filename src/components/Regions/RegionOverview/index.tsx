import { Paper } from '@mui/material';
import { RegionCardHeader } from '@region-x/components';
import { humanizer } from 'humanize-duration';
import { useEffect, useState } from 'react';

import { getRelativeTimeString, timesliceToTimestamp } from '@/utils/functions';

import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { RegionMetadata } from '@/models';

import styles from './index.module.scss';

interface RegionOverviewProps {
  regionMetadata: RegionMetadata;
}

export const RegionOverview = ({ regionMetadata }: RegionOverviewProps) => {
  const formatDuration = humanizer({ units: ['w', 'd', 'h'], round: true });

  const {
    state: { api: relayApi, isApiReady: isRelayReady },
  } = useRelayApi();

  const [beginTimestamp, setBeginTimestamp] = useState(0);
  const [endTimestamp, setEndTimestamp] = useState(0);

  const { region } = regionMetadata;
  const { timeslicePeriod } = useCoretimeApi();

  useEffect(() => {
    if (!relayApi || !isRelayReady) {
      return;
    }
    const fetchTimestamps = async () => {
      const begin = await timesliceToTimestamp(relayApi, region.getBegin(), timeslicePeriod);
      const end = await timesliceToTimestamp(relayApi, region.getEnd(), timeslicePeriod);

      setBeginTimestamp(begin);
      setEndTimestamp(end);
    };
    fetchTimestamps();
  }, [relayApi, isRelayReady, region, timeslicePeriod]);
  return (
    <Paper className={styles.container}>
      <RegionCardHeader
        rawId={regionMetadata.rawId.toString()}
        name={`Region ${region.getCore()}`}
        coreIndex={region.getCore()}
        duration={formatDuration(endTimestamp - beginTimestamp)}
        regionStart={getRelativeTimeString(beginTimestamp)}
        regionEnd={getRelativeTimeString(endTimestamp)}
      />
    </Paper>
  );
};
