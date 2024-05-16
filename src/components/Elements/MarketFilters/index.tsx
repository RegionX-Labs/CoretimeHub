import { Box, Typography } from '@mui/material';
import { useState } from 'react';

import { Listing } from '@/models';

import CoreOccupancyFilter from './coreOccupancyFilter';
import DurationFilter from './DurationFilter';
import PriceFilter from './PriceFilter';
import RegionEndFilter from './RegionEndFilter';
import RegionStartFilter from './RegionStartFilter';
import Sort from './sort';

export interface Props {
  listings: Array<Listing>;
  setFilteredListings: (_filtered: Array<Listing>) => void;
}

export interface FilterProps {
  filters: Filters;
  listings: Array<Listing>;
  updateFilters: (_filters: Filters) => void;
}

type Filters = {
  coreOccupancyFilter: (_listing: Listing) => boolean;
  durationFilter: (_listing: Listing) => boolean;
  priceFilter: (_listing: Listing) => boolean;
  regionStartFilter: (_listing: Listing) => boolean;
  regionEndFilter: (_listing: Listing) => boolean;
};

export const MarketFilters = ({ listings, setFilteredListings }: Props) => {
  const [filters, setFilters] = useState<Filters>({
    coreOccupancyFilter: () => true,
    durationFilter: () => true,
    priceFilter: () => true,
    regionStartFilter: () => true,
    regionEndFilter: () => true,
  });

  const updateFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setFilteredListings(
      listings.filter((listing) => filter(newFilters, listing))
    );
  };

  const filter = (f: Filters, listing: Listing): boolean => {
    return (
      f.coreOccupancyFilter(listing) &&
      f.durationFilter(listing) &&
      f.priceFilter(listing) &&
      f.regionStartFilter(listing) &&
      f.regionEndFilter(listing)
    );
  };

  return (
    <Box>
      <Box display='flex' justifyContent='space-between' alignItems='end'>
        <Box>
          <Typography variant='subtitle2'>Search filters: </Typography>
          <Box display='flex'>
            <Box marginRight='1em' marginTop='.5em'>
              <CoreOccupancyFilter
                listings={listings}
                filters={filters}
                updateFilters={updateFilters}
              />
            </Box>
            <Box marginRight='1em' marginTop='.5em'>
              <DurationFilter
                listings={listings}
                filters={filters}
                updateFilters={updateFilters}
              />
            </Box>
            <Box marginRight='1em' marginTop='.5em'>
              <RegionStartFilter
                listings={listings}
                filters={filters}
                updateFilters={updateFilters}
              />
            </Box>
            <Box marginRight='1em' marginTop='.5em'>
              <RegionEndFilter
                listings={listings}
                filters={filters}
                updateFilters={updateFilters}
              />
            </Box>
          </Box>
        </Box>
        <Box>
          <Typography variant='subtitle2'>Sort By: </Typography>
          <Box marginTop='.5em'>
            <Sort
              listings={listings}
              filter={(listing) => filter(filters, listing)}
              setFilteredListings={setFilteredListings}
            />
          </Box>
        </Box>
      </Box>
      <Box marginRight='1em' marginTop='1em' width='100%'>
        <PriceFilter
          listings={listings}
          filters={filters}
          updateFilters={updateFilters}
        />
      </Box>
    </Box>
  );
};
