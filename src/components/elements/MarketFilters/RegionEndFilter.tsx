import { Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';

import { timestampToTimeslice } from '@/utils/functions';

import { useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useCommon } from '@/contexts/common';

import { FilterProps } from '.';

const RegionEndFilter = ({ filters, updateFilters }: FilterProps) => {
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);

  const {
    state: { api: relayApi, apiState },
  } = useRelayApi();
  const { timeslicePeriod } = useCommon();

  const handleChange = async (newValue: Date | null) => {
    if (!relayApi || apiState !== ApiState.READY) return;
    setSelectedEnd(newValue);

    if (!newValue) {
      updateFilters({
        ...filters,
        regionEndFilter: () => true,
      });
      return;
    }
    const timestamp = newValue.getTime();
    const end = await timestampToTimeslice(
      relayApi,
      timestamp,
      timeslicePeriod
    );

    updateFilters({
      ...filters,
      regionEndFilter: (listing) => listing.region.getEnd() <= end,
    });
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Typography marginBottom={'.5em'}>Region End</Typography>
        <DatePicker
          label='Select date'
          value={selectedEnd}
          onChange={handleChange}
        />
      </LocalizationProvider>
    </>
  );
};

export default RegionEndFilter;
