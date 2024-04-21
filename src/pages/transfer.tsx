import ArrowDownward from '@mui/icons-material/ArrowDownwardOutlined';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  DialogActions,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';
import { useEffect, useState } from 'react';

import theme from '@/utils/muiTheme';
import { transferRegionOnCoretimeChain } from '@/utils/native/transfer';

import {
  ChainSelector,
  RecipientSelector,
  RegionCard,
  RegionSelector,
} from '@/components';

import { useCoretimeApi } from '@/contexts/apis';
import { RegionDataProvider, useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import { RegionLocation, RegionMetadata } from '@/models';

const TransferPage = () => {
  const { activeAccount, activeSigner } = useInkathon();

  const { toastError, toastInfo, toastWarning, toastSuccess } = useToast();
  const {
    state: { api: coretimeApi },
  } = useCoretimeApi();
  const { regions } = useRegions();

  const [filteredRegions, setFilteredRegions] = useState<Array<RegionMetadata>>(
    []
  );
  const [working, setWorking] = useState(false);

  const [newOwner, setNewOwner] = useState('');
  const [originChain, setOriginChain] = useState('');
  const [destinationChain, setDestinationChain] = useState('');
  const [statusLabel, _setStatusLabel] = useState('');

  const [selectedRegion, setSelectedRegion] = useState<RegionMetadata | null>(
    null
  );

  useEffect(() => {
    setFilteredRegions(
      regions.filter((r) => r.location != RegionLocation.MARKET)
    );
  }, [regions]);

  const handleOriginChange = (newOrigin: string) => {
    setOriginChain(newOrigin);
    if (newOrigin === 'CoretimeChain') {
      setFilteredRegions(
        regions.filter((r) => r.location == RegionLocation.CORETIME_CHAIN)
      );
    } else {
      setFilteredRegions(
        regions.filter((r) => r.location == RegionLocation.REGIONX_CHAIN)
      );
    }
  };

  const handleTransfer = async () => {
    if (!selectedRegion) {
      toastError('Select a region');
      return;
    }

    if (originChain === destinationChain) {
      originChain === 'CoretimeChain'
        ? transferCoretimeRegion(selectedRegion.region)
        : toastWarning('Currently not supported');
    } else {
      toastWarning('Currently not supported');
    }
  };

  const transferCoretimeRegion = async (region: Region) => {
    if (!coretimeApi || !activeAccount || !activeSigner) return;
    if (!newOwner) {
      toastError('Please input the new owner.');
      return;
    }

    setWorking(true);
    transferRegionOnCoretimeChain(
      coretimeApi,
      region,
      activeSigner,
      activeAccount.address,
      newOwner ? newOwner : activeAccount.address,
      {
        ready: () => toastInfo('Transaction was initiated.'),
        inBlock: () => toastInfo(`In Block`),
        finalized: () => setWorking(false),
        success: () => toastSuccess('Successfully transferred the region.'),
        error: () => {
          toastError(`Failed to transfer the region.`);
          setWorking(false);
        },
      }
    );
  };

  return (
    <Box>
      <Box>
        <Typography
          variant='subtitle1'
          sx={{ color: theme.palette.common.black }}
        >
          Cross-Chain Transfer
        </Typography>
        <Typography
          variant='subtitle2'
          sx={{ color: theme.palette.text.primary }}
        >
          Cross-chain transfer regions
        </Typography>
      </Box>
      <Box width='60%' margin='2em auto'>
        <Stack margin='1em 0' direction='column' gap={1}>
          <Typography>Origin chain:</Typography>
          <ChainSelector chain={originChain} setChain={handleOriginChange} />
        </Stack>
        <Stack margin='1em 0' direction='column' gap={1}>
          <Typography>Destination chain:</Typography>
          <ChainSelector
            chain={destinationChain}
            setChain={setDestinationChain}
          />
        </Stack>
        {originChain && (
          <Stack margin='1em 0' direction='column' gap={1}>
            <Typography>Region</Typography>
            <RegionSelector
              regions={filteredRegions}
              selectedRegion={selectedRegion}
              handleRegionChange={(indx) => setSelectedRegion(regions[indx])}
            />
          </Stack>
        )}
        {selectedRegion && (
          <Box
            sx={{
              transform: 'scale(0.8)',
              transformOrigin: 'center',
            }}
          >
            <RegionCard regionMetadata={selectedRegion} />
          </Box>
        )}
        <Stack margin='2em 0' direction='column' gap={1} alignItems='center'>
          <Typography>Transfer</Typography>
          <ArrowDownward />
        </Stack>
        <Stack direction='column' gap={1}>
          <Typography>Transfer to:</Typography>
          <RecipientSelector recipient={newOwner} setRecipient={setNewOwner} />
        </Stack>
        {statusLabel && (
          <Alert severity='info' sx={{ marginY: '2em' }}>
            {statusLabel}
          </Alert>
        )}
        <Box margin='2em 0'>
          <DialogActions>
            <Link href='/'>
              <Button variant='outlined'>Home</Button>
            </Link>
            <LoadingButton
              onClick={handleTransfer}
              variant='contained'
              loading={working}
            >
              Transfer
            </LoadingButton>
          </DialogActions>
        </Box>
      </Box>
    </Box>
  );
};

const TransferPageWrapped = () => {
  return (
    <RegionDataProvider>
      <TransferPage />
    </RegionDataProvider>
  )
}

export default TransferPageWrapped;
