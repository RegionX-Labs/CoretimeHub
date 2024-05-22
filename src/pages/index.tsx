import { Box, Grid, Typography, useTheme } from '@mui/material';

import { FeatureCard } from '@/components';

import Chart from '@/assets/chart.png';
import Config from '@/assets/config.png';
import Manage from '@/assets/manage.png';
import Trade from '@/assets/trade.png';

const Home = () => {
  const theme = useTheme();

  return (
    <Box>
      <Box>
        <Typography
          fontWeight={'light'}
          sx={{
            color: theme.palette.common.black,
            textAlign: 'center',
            fontSize: '32px',
          }}
        >
          Corehub | Home
        </Typography>
        <Typography
          variant='subtitle2'
          fontWeight={'light'}
          sx={{ color: theme.palette.common.black, textAlign: 'center' }}
        >
          Explore all the possibilities RegionX Corehub offers
        </Typography>
      </Box>
      <Box marginTop='2em'>
        <Grid spacing={8} container>
          <Grid container item xs={6}>
            <FeatureCard
              title='Purchase a core'
              enabled={true}
              image={Trade}
              buttonText='Go to Bulk Sale'
              href='/purchase'
            />
          </Grid>
          <Grid container item xs={6}>
            <FeatureCard
              title='Manage your regions'
              enabled={true}
              image={Config}
              buttonText='Region Dashboard'
              href='/regions'
            />
          </Grid>
          <Grid container item xs={6} direction='column'>
            <FeatureCard
              title='Track Blockspace Consumption'
              enabled={true}
              image={Chart}
              buttonText='Corespace Weigher'
              href='https://www.polkadot-weigher.com/'
            />
          </Grid>
          <Grid container item xs={6} direction='column'>
            <FeatureCard
              title='Parachain Dashboard'
              enabled={true}
              image={Manage}
              buttonText='Manage your parachain'
              href='/paras'
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;
