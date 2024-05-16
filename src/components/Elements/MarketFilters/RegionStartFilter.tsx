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

const RegionStartFilter = ({ filters, updateFilters }: FilterProps) => {
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);

  const {
    state: { api: relayApi, apiState },
  } = useRelayApi();
  const { timeslicePeriod } = useCommon();

  const handleChange = async (newValue: Date | null) => {
    if (!relayApi || apiState !== ApiState.READY) return;
    setSelectedStart(newValue);

    if (!newValue) {
      updateFilters({
        ...filters,
        regionStartFilter: () => true,
      });
      return;
    }
    const timestamp = newValue.getTime();
    const start = await timestampToTimeslice(
      relayApi,
      timestamp,
      timeslicePeriod
    );

    updateFilters({
      ...filters,
      regionStartFilter: (listing) => listing.region.getBegin() >= start,
    });
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Typography marginBottom='.5em'>Region starts by</Typography>
        <DatePicker
          label='Select date'
          value={selectedStart}
          onChange={handleChange}
        />
      </LocalizationProvider>
    </>
  );
};

export default RegionStartFilter;
