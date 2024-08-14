import { Box, Paper, Stack, Typography } from '@mui/material';
import { ChainSelector } from '@/components/Elements/Selectors/ChainSelector';
import AssetSelector from '@/components/Elements/Selectors/AssetSelector';
import { RegionSelector } from '@/components/Elements/Selectors/RegionSelector';
import { useTransferState } from './hooks/useTransferState';
import { AssetType, ChainType } from '@/models';
import theme from '@/utils/muiTheme';

const TransferForm = () => {
  const {
    originChain,
    setOriginChain,
    destinationChain,
    setDestinationChain,
    filteredRegions,
    selectedRegion,
    setSelectedRegion,
    asset,
    setAsset,
    symbol,
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

        {/* Asset Selector */}
        {originChain !== ChainType.NONE &&
          destinationChain !== ChainType.NONE && (
            <Stack margin='1em 0' direction='column' gap={1}>
              <AssetSelector
                symbol={symbol}
                asset={asset}
                setAsset={setAsset}
              />
            </Stack>
          )}

        {/* Region Selector */}
        {asset === AssetType.REGION &&
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
