import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SettingsInputComponentRoundedIcon from '@mui/icons-material/SettingsInputComponentRounded';
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Paper,
  Popover,
  Select,
  Slider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { BN } from '@polkadot/util';
import { Timeslice } from 'coretime-utils';
import React, { useState } from 'react';

import { ActionButton, DateInput } from '@/components/Elements';

import { useRegionXApi } from '@/contexts/apis/RegionXApi';
import { useMarket } from '@/contexts/market';
import { MarketFilterOptions, WEEK_IN_TIMESLICES } from '@/models';

type Range = {
  min: number;
  max: number;
};

type RangeOption = {
  limit: Range;
  label: string;
};

const coreOccupancyOptions: RangeOption[] = [
  { limit: { min: 0, max: 1 }, label: 'Show All' },
  { limit: { min: 0, max: 0.25 }, label: '0% - 25%' },
  { limit: { min: 0.25, max: 0.5 }, label: '25% - 50%' },
  { limit: { min: 0.5, max: 0.75 }, label: '50% - 75%' },
  { limit: { min: 0.75, max: 1 }, label: '75% - 100%' },
];

type DurationOption = {
  duration?: Timeslice;
  label: string;
};

const durationOptions: DurationOption[] = [
  { duration: undefined, label: 'Show All' },
  { duration: WEEK_IN_TIMESLICES, label: '1 week' },
  { duration: 2 * WEEK_IN_TIMESLICES, label: '2 weeks' },
  { duration: 3 * WEEK_IN_TIMESLICES, label: '3 weeks' },
  { duration: 4 * WEEK_IN_TIMESLICES, label: '4 weeks' },
];

interface MarketFilterProps {
  onChange: (_: MarketFilterOptions) => void;
}

type FilterState = {
  startDate: Date | null;
  endDate: Date | null;
  occupancyIndex: number;
  durationIndex: number;
  priceRange: [number, number] | undefined;
};

const defaultFilterState: FilterState = {
  startDate: null,
  endDate: null,
  occupancyIndex: 0,
  durationIndex: 0,
  priceRange: undefined,
};

interface FilterItemProps {
  label: string;
  children: React.ReactNode;
}

const FilterItem = ({ label, children }: FilterItemProps) => {
  const theme = useTheme();
  return (
    <Stack direction='column' gap='0.5rem'>
      <Typography
        sx={{
          color: theme.palette.common.black,
          fontWeight: 600,
          fontSize: '0.75rem',
        }}
      >
        {label}
      </Typography>
      <FormControl fullWidth>{children}</FormControl>
    </Stack>
  );
};

export const MarketFilter = ({ onChange }: MarketFilterProps) => {
  const theme = useTheme();
  const {
    state: { symbol, decimals },
  } = useRegionXApi();
  const { listedRegions } = useMarket();

  const unit = Math.pow(10, decimals);
  const maxPriceRange =
    listedRegions.length === 0
      ? 100
      : Math.floor(
          (Math.max(
            ...listedRegions.map((item) => item.currentPrice.toNumber())
          ) +
            unit -
            1) /
            unit
        );

  // Filters
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [occupancyIndex, setOccupancyIndex] = useState(0);
  const [durationIndex, setDurationIndex] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number] | undefined>([
    0,
    maxPriceRange,
  ]);

  const [filter, setFilter] = useState<FilterState>(defaultFilterState);

  // Filter popover
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'popover-filters' : undefined;
  const openFilters = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeFilters = () => {
    setAnchorEl(null);

    setStartDate(filter.startDate);
    setEndDate(filter.endDate);
    setOccupancyIndex(filter.occupancyIndex);
    setDurationIndex(filter.durationIndex);
    setPriceRange(filter.priceRange);
  };

  const clearFilters = () => {
    setStartDate(defaultFilterState.startDate);
    setEndDate(defaultFilterState.endDate);
    setOccupancyIndex(defaultFilterState.occupancyIndex);
    setDurationIndex(defaultFilterState.durationIndex);
    setPriceRange([0, maxPriceRange]);

    setFilter(defaultFilterState);
  };

  const applyFilters = () => {
    /** Apply filters */
    setFilter({
      startDate,
      endDate,
      occupancyIndex,
      durationIndex,
      priceRange,
    } as FilterState);

    onChange({
      startDate,
      endDate,
      coreOccupancy: coreOccupancyOptions[occupancyIndex].limit,
      minDuration: durationOptions[durationIndex].duration,
      price:
        priceRange === undefined
          ? undefined
          : {
              min: new BN(priceRange[0] * unit),
              max: new BN(priceRange[1] * unit),
            },
    } as MarketFilterOptions);
  };

  return (
    <Box>
      <Button
        aria-describedby={id}
        onClick={(e) => openFilters(e)}
        sx={{
          background: open
            ? theme.palette.common.black
            : theme.palette.common.white,
          color: open ? theme.palette.common.white : theme.palette.common.black,
          borderRadius: '2rem',
          px: '1.5rem',
          height: '100%',
          fontSize: '1rem',
          fontWeight: 400,
        }}
        endIcon={<SettingsInputComponentRoundedIcon />}
      >
        Filters
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => closeFilters()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ padding: '1.5rem', width: '20rem' }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                color: theme.palette.common.black,
              }}
            >
              Filters
            </Typography>
            <Button
              startIcon={<CloseOutlinedIcon />}
              sx={{
                color: theme.palette.common.black,
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => clearFilters()}
            >
              Clear all
            </Button>
          </Stack>
          <Stack direction='column' gap='1rem' sx={{ my: '1rem' }}>
            <FilterItem label='Start date'>
              <DateInput value={startDate} onChange={(v) => setStartDate(v)} />
            </FilterItem>
            <FilterItem label='End date'>
              <DateInput
                value={endDate}
                onChange={(v) => setEndDate(v)}
                minDate={startDate === null ? undefined : startDate}
              />
            </FilterItem>
            <FilterItem label='Core Occupancy'>
              <Select
                value={occupancyIndex}
                onChange={(e) => setOccupancyIndex(e.target.value as number)}
                sx={{
                  '.MuiSelect-select': {
                    background: theme.palette.common.white,
                  },
                  '.MuiOutlinedInput-notchedOutline': {
                    borderRadius: '0.5rem',
                  },
                  '.MuiOutlinedInput-input': {
                    py: '0.75rem',
                  },
                }}
              >
                {coreOccupancyOptions.map(({ label }, index) => (
                  <MenuItem key={label} value={index}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FilterItem>
            <FilterItem label='Region duration at least'>
              <Select
                value={durationIndex}
                onChange={(e) => setDurationIndex(e.target.value as number)}
                sx={{
                  '.MuiSelect-select': {
                    background: theme.palette.common.white,
                  },
                  '.MuiOutlinedInput-notchedOutline': {
                    borderRadius: '0.5rem',
                  },
                  '.MuiOutlinedInput-input': {
                    py: '0.75rem',
                  },
                }}
              >
                {durationOptions.map(({ label }, index) => (
                  <MenuItem key={label} value={index}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FilterItem>
            <FilterItem label='Price range'>
              <Slider
                value={priceRange}
                max={maxPriceRange}
                onChange={(_event: Event, newValue: number | number[]) =>
                  setPriceRange(newValue as [number, number])
                }
                valueLabelDisplay='on'
                valueLabelFormat={(value) => `${value} ${symbol}`}
                sx={{ width: '90%', margin: '0 auto', mt: '2rem' }}
              />
            </FilterItem>
          </Stack>
          <Box>
            <ActionButton
              label='Apply Filters'
              onClick={() => applyFilters()}
              fullWidth
            />
          </Box>
        </Paper>
      </Popover>
    </Box>
  );
};
