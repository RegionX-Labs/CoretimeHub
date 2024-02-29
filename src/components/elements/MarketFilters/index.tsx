import { Box, Typography } from '@mui/material';

import { Listing } from '@/models';

import CoreOccupancyFilter from './coreOccupancyFilter';
import DurationFilter from './DurationFilter';
import PriceFilter from './PriceFilter';
import Sort from './sort';

export interface Props {
  listings: Array<Listing>;
  setFilteredListings: (_filtered: Array<Listing>) => void;
}

const MarketFilters = (props: Props) => {
  return (
    <Box
      display={'flex'}
      justifyContent={'space-between'}
      alignItems={'center'}
    >
      <Box>
        <Typography variant='subtitle2'>Search filters: </Typography>
        <Box display={'flex'}>
          <Box marginRight={'1em'} marginTop={'.5em'}>
            <CoreOccupancyFilter {...props} />
          </Box>
          <Box marginRight={'1em'} marginTop={'.5em'}>
            <DurationFilter {...props} />
          </Box>
          <Box marginRight={'1em'} marginTop={'.5em'}>
            <PriceFilter {...props} />
          </Box>
        </Box>
      </Box>
      <Box marginRight={'1em'} marginTop={'.5em'}>
        <Sort {...props} />
      </Box>
    </Box>
  );
};

export default MarketFilters;
