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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BN } from '@polkadot/util';
import { Region, RegionId, RegionRecord, Timeslice } from 'coretime-utils';
import { useState } from 'react';

import {
  ActionButton,
  DateInput,
  MarketRegion,
  PurchaseModal,
} from '@/components';

import { useCoretimeApi } from '@/contexts/apis';
import { useMarket } from '@/contexts/market';
import { Listing, WEEK_IN_TIMESLICES } from '@/models';

// eslint-disable-next-line no-unused-vars
enum SortOption {
  // eslint-disable-next-line no-unused-vars
  CheapestFirst = 'CheapestFirst',
  // eslint-disable-next-line no-unused-vars
  ExpensiveFirst = 'ExpensiveFirst',
  // 'ppt' stands for price per timeslice
  // eslint-disable-next-line no-unused-vars
  LowestPptFirst = 'LowestPptFirst',
  // eslint-disable-next-line no-unused-vars
  HighestPptFirst = 'HighestPptFirst',
}
type Option = {
  sortOption: SortOption;
  label: string;
};
const sortOptions: Option[] = [
  { sortOption: SortOption.CheapestFirst, label: 'Cheapest first' },
  { sortOption: SortOption.ExpensiveFirst, label: 'Expensive first' },
  {
    sortOption: SortOption.LowestPptFirst,
    label: 'Lowest price per timeslice first',
  },
  {
    sortOption: SortOption.HighestPptFirst,
    label: 'Highest price per timeslice first',
  },
];

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
  { limit: { lowerLimit: 0, upperLimit: 0.25 }, label: '0% - 25%' },
  { limit: { lowerLimit: 0.25, upperLimit: 0.5 }, label: '25% - 50%' },
  { limit: { lowerLimit: 0.5, upperLimit: 0.75 }, label: '50% - 75%' },
  { limit: { lowerLimit: 0.75, upperLimit: 1 }, label: '75% - 100%' },
];

type DurationOption = {
  duration: Timeslice;
  label: string;
};

const durationOptions: DurationOption[] = [
  { duration: 0, label: 'Show All' },
  { duration: WEEK_IN_TIMESLICES, label: '1 week' },
  { duration: 2 * WEEK_IN_TIMESLICES, label: '2 weeks' },
  { duration: 3 * WEEK_IN_TIMESLICES, label: '3 weeks' },
  { duration: 4 * WEEK_IN_TIMESLICES, label: '4 weeks' },
];
const mockup = {
  region: new Region(
    {
      begin: 135510,
      core: 40,
      mask: '0x0000000000000000ffff',
    } as RegionId,
    {
      end: 136050,
      owner: '5EULYMVuML584aiyacnwjw1sb9iXu9NkdMVLz3MCgCrHmSFn',
      paid: null,
    } as RegionRecord
  ),
  regionConsumed: 0.75,
  regionCoreOccupancy: 0.8,
  seller: '5EULYMVuML584aiyacnwjw1sb9iXu9NkdMVLz3MCgCrHmSFn',
  timeslicePrice: new BN('2300000000000'),
  currentPrice: new BN('5300000000000'),
  saleRecepient: null,
} as Listing;

const Marketplace = () => {
  const theme = useTheme();
  const { fetchMarket } = useMarket();
  const {
    state: { symbol },
  } = useCoretimeApi();

  const [purchaseModalOpen, openPurhcaseModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [filteredListings] = useState<Listing[]>(
    [1, 2, 3, 4, 5, 6].map(() => mockup)
  );

  // Filters
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [orderBy, setOrderBy] = useState<SortOption>(SortOption.CheapestFirst);
  const [selectedRange, setSelectedRange] = useState(rangeOptions[0].limit);
  const [selectedDuration, setSelectedDuration] = useState<Timeslice>(0);
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);

  // Filter popover
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'popover-filters' : undefined;
  const openFilters = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeFilters = () => {
    setAnchorEl(null);
  };

  const onPurchase = (listing: Listing) => {
    setSelectedListing(listing);
    openPurhcaseModal(true);
  };

  // useEffect(() => {
  //   setFilteredListings(listedRegions);
  // }, [listedRegions]);

  const clearFilters = () => {
    setSelectedRange(rangeOptions[0].limit);
    setSelectedDuration(0);
    setPriceRange([0, 100]);
  };

  const applyFilters = () => {
    /** Apply filters */
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Explore the market
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Explore all the regions listed on the marketplace
          </Typography>
        </Box>
        <Stack direction='row' gap='0.5rem'>
          <DateInput
            label='Start date'
            value={startDate}
            onChange={(v) => setStartDate(v)}
          />
          <DateInput
            label='End date'
            value={endDate}
            onChange={(v) =>
              setEndDate(
                v === null || startDate === null || v < startDate ? null : v
              )
            }
          />
          <Box>
            <Button
              aria-describedby={id}
              onClick={(e) => openFilters(e)}
              sx={{
                background: open
                  ? theme.palette.common.black
                  : theme.palette.common.white,
                color: open
                  ? theme.palette.common.white
                  : theme.palette.common.black,
                borderRadius: '2rem',
                px: '1rem',
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
                  <Stack direction='column' gap='0.5rem'>
                    <Typography
                      sx={{
                        color: theme.palette.common.black,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      Core Occupancy
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={JSON.stringify(selectedRange)}
                        onChange={(e) =>
                          setSelectedRange(JSON.parse(e.target.value) as Range)
                        }
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
                        {rangeOptions.map(({ label, limit }) => (
                          <MenuItem key={label} value={JSON.stringify(limit)}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <Stack direction='column' gap='0.5rem'>
                    <Typography
                      sx={{
                        color: theme.palette.common.black,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      Region duration at least
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={selectedDuration}
                        onChange={(e) =>
                          setSelectedDuration(e.target.value as number)
                        }
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
                        {durationOptions.map(({ label, duration }) => (
                          <MenuItem key={label} value={duration}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <Stack direction='column' gap='0.5rem'>
                    <Typography
                      sx={{
                        color: theme.palette.common.black,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      Price range
                    </Typography>
                  </Stack>
                  <Slider
                    value={priceRange}
                    onChange={(_event: Event, newValue: number | number[]) =>
                      setPriceRange(newValue as number[])
                    }
                    valueLabelDisplay='on'
                    valueLabelFormat={(value) => `${value} ${symbol}`}
                    sx={{ width: '90%', margin: '0 auto', mt: '2rem' }}
                  />
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
          <Select
            sx={{
              width: '16rem',
              '.MuiOutlinedInput-input': {
                borderRadius: '2rem',
                background: theme.palette.common.white,
                color: theme.palette.common.black,
              },
              '.MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value as SortOption)}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.label} value={option.sortOption}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Box>

      {filteredListings.length > 0 && (
        <Box
          marginTop='2rem'
          display='flex'
          flexWrap='wrap'
          justifyContent='space-around'
        >
          {filteredListings.map((listing, indx) => (
            <Box key={indx} margin='1em'>
              <MarketRegion listing={listing} onPurchase={onPurchase} />
            </Box>
          ))}
        </Box>
      )}
      {selectedListing && (
        <PurchaseModal
          open={purchaseModalOpen}
          onClose={() => {
            fetchMarket();
            openPurhcaseModal(false);
          }}
          listing={selectedListing}
        />
      )}
    </Box>
  );
};

export default Marketplace;
