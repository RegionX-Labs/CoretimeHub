import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { Timeslice } from 'coretime-utils';
import { useState } from 'react';

import { WEEK_IN_TIMESLICES } from '@/models';

import { FilterProps } from '.';

const DurationFilter = ({ filters, updateFilters }: FilterProps) => {
  type Option = {
    duration: Timeslice;
    label: string;
  };

  const options: Option[] = [
    { duration: Number.MAX_VALUE, label: 'Show All' },
    { duration: WEEK_IN_TIMESLICES, label: '1 week' },
    { duration: 2 * WEEK_IN_TIMESLICES, label: '2 weeks' },
    { duration: 3 * WEEK_IN_TIMESLICES, label: '3 weeks' },
    { duration: 4 * WEEK_IN_TIMESLICES, label: '4 weeks' },
  ];

  const [selectedDuration, setSelectedDuration] = useState<Timeslice>(
    Number.MAX_VALUE
  );

  const handleChange = (event: SelectChangeEvent) => {
    const duration = Number(event.target.value);
    setSelectedDuration(duration);
    updateFilters({
      ...filters,
      durationFilter: (listing) =>
        listing.region.getEnd() - listing.region.getBegin() <= duration,
    });
  };

  return (
    <Box width={230}>
      <Typography marginBottom={'.5em'}>Region Duration</Typography>
      <FormControl fullWidth>
        <InputLabel id='range-dropdown-label'>Range</InputLabel>
        <Select
          labelId='range-dropdown-label'
          id='range-dropdown'
          value={selectedDuration.toString()}
          label='Range'
          onChange={handleChange}
        >
          {options.map((option) => (
            <MenuItem key={option.label} value={option.duration}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default DurationFilter;
