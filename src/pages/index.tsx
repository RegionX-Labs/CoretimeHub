import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';

import { RegionCard } from '@/components';

import { useRegions } from '@/contexts/regions';
import {
  AssignmentIcon,
  InterlaceIcon,
  PartitionIcon,
  TransferIcon,
} from '@/icons';

const Home = () => {
  const theme = useTheme();
  const { regions, loading } = useRegions();
  const management = [
    { label: 'partition', icon: PartitionIcon },
    { label: 'interlace', icon: InterlaceIcon },
    { label: 'transfer', icon: TransferIcon },
    { label: 'assign', icon: AssignmentIcon },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: '1rem' }}>
      <Box sx={{ maxWidth: '45rem', flexGrow: 1, overflow: 'auto' }}>
        <Box>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.secondary }}
          >
            Manage your cores
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.text.primary }}
          >
            Regions Dashboard
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            mt: '1rem',
          }}
        >
          <Backdrop open={loading}>
            <CircularProgress />
          </Backdrop>
          {regions.map((region, index) => (
            <RegionCard
              key={index}
              region={{ ...region, id: (index + 1).toString() }}
            />
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          color: theme.palette.text.secondary,
          background: theme.palette.background.default,
          minWidth: 280,
          height: 500,
          margin: 'auto',
          padding: '2rem 3rem',
        }}
      >
        <Typography variant='h1'>Manage</Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginTop: '3rem',
            alignItems: 'flex-start',
          }}
        >
          {management.map(({ label, icon: Icon }, index) => (
            <Button
              key={index}
              sx={{
                color: theme.palette.text.secondary,
                textTransform: 'capitalize',
              }}
              startIcon={<Icon color={theme.palette.text.secondary} />}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
