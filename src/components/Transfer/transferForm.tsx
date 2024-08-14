import { Box, Paper, Stack, Typography } from '@mui/material';

import theme from '@/utils/muiTheme';

import { ChainSelector } from '@/components/Elements/Selectors/ChainSelector';
import { RegionSelector } from '@/components/Elements/Selectors/RegionSelector';

import { AssetType, ChainType } from '@/models';

import { assetType } from './common';
import { useTransferState } from './contexts/transferState';

const TransferForm = () => {
  const {
    originChain,
    setOriginChain,
    destinationChain,
    setDestinationChain,
    filteredRegions,
    selectedRegion,
    setSelectedRegion,
  } = useTransferState();

  return (
    <Box width='60%' margin='0.5rem auto'>
      <Paper
        sx={{
          padding: '2rem',
          borderRadius: '2rem',
          mb: '2rem',
          boxShadow: 'none',
        }}
      >
        {/* Origin Chain */}
        <Stack margin='0.5rem 0' direction='column' gap='1rem'>
          <Typography
            sx={{ color: theme.palette.common.black, fontSize: '1.25rem' }}
          >
            Origin chain:
          </Typography>
          <ChainSelector chain={originChain} setChain={setOriginChain} />
        </Stack>

        {/* Destination Chain */}
        <Stack margin='1rem 0' direction='column' gap='1rem'>
          <Typography
            sx={{ color: theme.palette.common.black, fontSize: '1.25rem' }}
          >
            Destination chain:
          </Typography>
          <ChainSelector
            chain={destinationChain}
            setChain={setDestinationChain}
          />
        </Stack>

        {/* Region Selector */}
        {assetType(originChain, destinationChain) === AssetType.REGION &&
          originChain !== ChainType.NONE &&
          destinationChain !== ChainType.NONE && (
            <Stack margin='1em 0' direction='column' gap={1}>
              <Typography>Region</Typography>
              <RegionSelector
                regions={filteredRegions}
                selectedRegion={selectedRegion}
                handleRegionChange={(indx) =>
                  setSelectedRegion(filteredRegions[indx])
                }
              />
            </Stack>
          )}
      </Paper>
    </Box>
  );
};

export default TransferForm;
