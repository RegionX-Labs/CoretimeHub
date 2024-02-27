import { Box, Typography } from '@mui/material';

import theme from '@/utils/muiTheme';

import { ListingCard } from '@/components/elements/ListingCard';

import { useMarket } from '@/contexts/market';

const Page = () => {
  const { listedRegions } = useMarket();

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
            variant='subtitle2'
            sx={{ color: theme.palette.text.secondary }}
          >
            Explore all the regions listed on the marketplace
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.text.primary }}
          >
            Explore the market
          </Typography>
        </Box>
      </Box>
      <Box marginTop={'2rem'}>
        {listedRegions.map((listing, indx) => (
          <ListingCard key={indx} listing={listing} />
        ))}
      </Box>
    </Box>
  );
};

export default Page;
