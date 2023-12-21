import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

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

  const [currentRegion, setCurrentRegion] = useState<number>();

  const renewable =
    currentRegion !== undefined && regions[currentRegion].paid !== null;

  const management = [
    { label: 'partition', icon: PartitionIcon, disabled: renewable },
    { label: 'interlace', icon: InterlaceIcon, disabled: renewable },
    { label: 'transfer', icon: TransferIcon, disabled: !renewable },
    { label: 'assign', icon: AssignmentIcon, disabled: renewable },
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
            <Box key={index} onClick={() => setCurrentRegion(index)}>
              <RegionCard
                region={{
                  ...region,
                  name: region.name ?? `Region #${index + 1}`,
                }}
                active={index === currentRegion}
              />
            </Box>
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
          {management.map(({ label, icon: Icon, disabled }, index) => (
            <Button
              key={index}
              sx={{
                color: theme.palette.text.secondary,
                textTransform: 'capitalize',
              }}
              startIcon={<Icon color={theme.palette.text.secondary} />}
              disabled={disabled}
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
