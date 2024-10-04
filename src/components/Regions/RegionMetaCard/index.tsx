import { RegionCard } from '@region-x/components';
import { humanizer } from 'humanize-duration';
import React, { useEffect, useState } from 'react';

import { getRelativeTimeString, timesliceToTimestamp } from '@/utils/functions';

import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useTasks } from '@/contexts/tasks';
import { POOLING_TASK_ID, RegionLocation, RegionMetadata } from '@/models';

interface RegionMetaCardProps {
  regionMetadata: RegionMetadata;
  active?: boolean;
}

export const RegionMetaCard = ({ active, regionMetadata }: RegionMetaCardProps) => {
  const { tasks } = useTasks();

  const formatDuration = humanizer({ units: ['w', 'd', 'h'], round: true });
  const { region, taskId, location } = regionMetadata;

  const [beginTimestamp, setBeginTimestamp] = useState(0);
  const [endTimestamp, setEndTimestamp] = useState(0);

  const {
    state: { api, apiState },
  } = useRelayApi();

  const { timeslicePeriod } = useCoretimeApi();

  useEffect(() => {
    if (!api || apiState !== ApiState.READY || !api.isConnected) {
      return;
    }

    const fetchTimestamps = async () => {
      const begin = await timesliceToTimestamp(api, region.getBegin(), timeslicePeriod);
      const end = await timesliceToTimestamp(api, region.getEnd(), timeslicePeriod);

      setBeginTimestamp(begin);
      setEndTimestamp(end);
    };
    fetchTimestamps();
  }, [api, apiState, region, timeslicePeriod]);

  const locationToLabel = (location: RegionLocation): string => {
    if (location === RegionLocation.REGIONX_CHAIN) {
      return 'RegionX Chain';
    } else {
      return 'Coretime Chain';
    }
  };

  const getTask = (taskId: number | null): string => {
    if (taskId === POOLING_TASK_ID) return 'Instantaneous Pool';
    const getTaskName = (taskId: number) => {
      return tasks.find(({ id }) => id === taskId)?.name || '';
    };

    if (taskId !== null) {
      return getTaskName(taskId) ? getTaskName(taskId) : `Parachain ${taskId}`;
    }
    return 'Unassigned';
  };

  return (
    <div style={{ width: '450px' }}>
      <RegionCard
        regionData={{
          name: regionMetadata.name || `Region ${regionMetadata.region.getCore()}`,
          regionStart: getRelativeTimeString(beginTimestamp),
          regionEnd: getRelativeTimeString(endTimestamp),
          coreIndex: region.getCore(),
          consumed: Number(parseFloat((regionMetadata.consumed * 100).toString()).toFixed(2)),
          chainLabel: locationToLabel(location),
          chainColor: location === RegionLocation.CORETIME_CHAIN ? 'purpleDark' : 'blueDark',
          coreOcupaccy: regionMetadata.coreOccupancy * 100,
          duration: formatDuration(endTimestamp - beginTimestamp),
          currentUsage: regionMetadata.currentUsage * 100,
        }}
        task={`${getTask(taskId)}`}
        selected={active}
      />
    </div>
  );
};
