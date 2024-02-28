import { Listing } from '@/models';
import { Box, Typography } from '@mui/material';
import CoreOccupancyFilter from './coreOccupancyFilter';
import DurationFilter from './DurationFilter';

export interface Props {
  listings: Array<Listing>;
  setFilteredListings: (_filtered: Array<Listing>) => void;
}

const MarketFilters = (props: Props) => {
  return (
    <Box>
      <Typography variant='subtitle2'>Search filters: </Typography>
      <Box display={'flex'}>
        <Box marginRight={'1em'} marginTop={'.5em'}>
          <CoreOccupancyFilter {...props} />
        </Box>
        <Box marginRight={'1em'} marginTop={'.5em'}>
          <DurationFilter {...props} />
        </Box>
      </Box>
    </Box>
  );
};

export default MarketFilters;
