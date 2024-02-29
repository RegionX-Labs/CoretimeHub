import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { FilterProps } from '.';

const CoreOccupancyFilter = ({ filters, updateFilters }: FilterProps) => {
  type Range = {
    lowerLimit: number;
    upperLimit: number;
  };

  type RangeOption = {
    limit: Range;
    label: string;
  };

  const rangeOptions: RangeOption[] = [
    { limit: { lowerLimit: 0, upperLimit: 1 }, label: 'Show All' },
    { limit: { lowerLimit: 0, upperLimit: 0.25 }, label: '0%-25%' },
    { limit: { lowerLimit: 0.25, upperLimit: 0.5 }, label: '25%-50%' },
    { limit: { lowerLimit: 0.5, upperLimit: 0.75 }, label: '50%-75%' },
    { limit: { lowerLimit: 0.75, upperLimit: 1 }, label: '75%-100%' },
  ];

  const [selectedRange, setSelectedRange] = useState<string>(
    JSON.stringify(rangeOptions[0].limit)
  );

  const handleChange = (event: SelectChangeEvent) => {
    const range = JSON.parse(event.target.value) as Range;
    setSelectedRange(JSON.stringify(range));
    updateFilters({
      ...filters,
      coreOccupancyFilter: (listing) =>
        listing.region.coreOccupancy() >= range.lowerLimit &&
        listing.region.coreOccupancy() <= range.upperLimit,
    });
  };

  return (
    <Box width={240}>
      <Typography marginBottom={'.5em'}>Core Occupancy</Typography>
      <FormControl fullWidth>
        <InputLabel id='range-dropdown-label'>Range</InputLabel>
        <Select
          labelId='range-dropdown-label'
          id='range-dropdown'
          value={selectedRange}
          label='Range'
          onChange={handleChange}
        >
          {rangeOptions.map((option) => (
            <MenuItem key={option.label} value={JSON.stringify(option.limit)}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CoreOccupancyFilter;
