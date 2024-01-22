import { Box, Grid, Typography, useTheme } from '@mui/material';

import FeatureCard from '@/components/elements/FeatureCard';

import Chart from '@/assets/chart.png';
import Config from '@/assets/config.png';
import Split from '@/assets/split.png';
import Trade from '@/assets/trade.png';

const Home = () => {
  const theme = useTheme();

  return (
    <Box>
      <Box>
        <Typography
          variant='subtitle2'
          sx={{ color: theme.palette.text.secondary }}
        >
          Explore all the possibilities RegionX offers
        </Typography>
        <Typography
          variant='subtitle1'
          sx={{ color: theme.palette.text.primary }}
        >
          Home
        </Typography>
      </Box>
      <Box marginTop='2em'>
        <Grid spacing={8} container>
          <Grid container item xs={6}>
            <FeatureCard
              title={'Manage your regions'}
              image={Config}
              buttonText={'Region Dashboard'}
              href='/regions'
            />
          </Grid>
          <Grid container item xs={6} direction='column'>
            <FeatureCard
              title={'Track Blockspace Consumption'}
              image={Chart}
              buttonText={'Corespace Weigher'}
              href='https://www.polkadot-weigher.com/'
            />
          </Grid>
          <Grid container item xs={6} direction='column'>
            <FeatureCard
              title={'Share a Polkadot Core'}
              image={Split}
              buttonText={'SOON'}
              href='/'
            />
          </Grid>
          <Grid container item xs={6} direction='column'>
            <FeatureCard
              title={'Trade Coretime'}
              image={Trade}
              buttonText={'Explore the market'}
              href='/'
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;
