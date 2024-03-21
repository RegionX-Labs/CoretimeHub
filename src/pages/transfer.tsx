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
import { ApiPromise, Keyring } from '@polkadot/api';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useContract, useInkathon } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';
import { useCallback, useEffect, useState } from 'react';

import {
  contractsToCoretimeTransfer,
  coretimeToContractsTransfer,
} from '@/utils/crossChain/transfer';
import theme from '@/utils/muiTheme';
import { approveNonWrappedRegion } from '@/utils/native/approve';
import { initRegionMetadata } from '@/utils/native/init';
import { removeXcRegionWrapper } from '@/utils/native/remove';
import {
  transferRegionOnContractsChain,
  transferRegionOnCoretimeChain,
} from '@/utils/native/transfer';

import {
  ChainSelector,
  RecipientSelector,
  RegionCard,
  RegionSelector,
} from '@/components';

import { useCoretimeApi } from '@/contexts/apis';
import { CONTRACT_XC_REGIONS } from '@/contexts/apis/consts';
import { useRegions } from '@/contexts/regions';
import { getNonWrappedRegions } from '@/contexts/regions/xc';
import { useToast } from '@/contexts/toast';
import XcRegionsMetadata from '@/contracts/xc_regions.json';
import { RegionLocation, RegionMetadata } from '@/models';

const TransferPage = () => {
  const { activeAccount, activeSigner, api: contractsApi } = useInkathon();
  const { contract } = useContract(XcRegionsMetadata, CONTRACT_XC_REGIONS);

  const { toastError, toastInfo, toastSuccess } = useToast();
  const {
    state: { api: coretimeApi },
  } = useCoretimeApi();
  const { regions, fetchRegions } = useRegions();

  const [filteredRegions, setFilteredRegions] = useState<Array<RegionMetadata>>(
    []
  );
  const [working, setWorking] = useState(false);

  const [newOwner, setNewOwner] = useState('');
  const [originChain, setOriginChain] = useState('');
  const [destinationChain, setDestinationChain] = useState('');
  const [statusLabel, setStatusLabel] = useState('');

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
        regions.filter((r) => r.location == RegionLocation.CONTRACTS_CHAIN)
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
        : transferXcRegion(selectedRegion.region);
    } else {
      originChain === 'CoretimeChain'
        ? transferFromCoretimeChain(selectedRegion.region)
        : transferFromContractsChain(selectedRegion.region);
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

  const transferXcRegion = async (region: Region) => {
    if (!contractsApi || !activeAccount || !contract) {
      return;
    }

    setWorking(true);
    transferRegionOnContractsChain(
      { contractsApi, xcRegionsContract: contract, marketContract: undefined },
      region,
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

  const transferFromCoretimeChain = async (region: Region) => {
    if (!coretimeApi || !activeAccount || !activeSigner) return;

    setStatusLabel('Initiating transfer from coretime chain');
    const receiverKeypair = new Keyring();
    receiverKeypair.addFromAddress(newOwner ? newOwner : activeAccount.address);

    const regionId = region.getEncodedRegionId(contractsApi);
    setWorking(true);
    coretimeToContractsTransfer(
      coretimeApi,
      { address: activeAccount.address, signer: activeSigner },
      regionId,
      receiverKeypair.pairs[0].publicKey,
      {
        ready: () => toastInfo('Transaction was initiated.'),
        inBlock: () => toastInfo(`In Block`),
        finalized: () => setWorking(false),
        success: () => {
          toastSuccess('Successfully transferred the region.');
          setStatusLabel('Waiting to wrap the region...');
        },
        error: () => {
          toastError(`Failed to transfer the region.`);
          setWorking(false);
        },
      }
    );
  };

  const transferFromContractsChain = async (region: Region) => {
    if (!contractsApi || !activeAccount || !activeSigner) return;

    removeWrapper(region, () => {
      setStatusLabel('Initiating transfer from contracts chain');
      const receiverKeypair = new Keyring();
      receiverKeypair.addFromAddress(
        newOwner ? newOwner : activeAccount.address
      );

      const regionId = region.getEncodedRegionId(contractsApi);
      setWorking(true);
      contractsToCoretimeTransfer(
        contractsApi,
        { address: activeAccount.address, signer: activeSigner },
        regionId,
        receiverKeypair.pairs[0].publicKey,
        {
          ready: () => toastInfo('Transaction was initiated.'),
          inBlock: () => toastInfo(`In Block`),
          finalized: () => setWorking(false),
          success: () => {
            toastSuccess('Successfully transferred the region.');
            setStatusLabel('');
          },
          error: () => {
            toastError(`Failed to transfer the region.`);
            setWorking(false);
          },
        }
      );
    });
  };

  const removeWrapper = async (region: Region, onSuccess: () => void) => {
    if (!activeAccount || !activeSigner) return;

    setStatusLabel('Unwrapping xc-region...');

    setWorking(true);
    removeXcRegionWrapper(
      {
        contractsApi,
        xcRegionsContract: contract,
        marketContract: undefined,
      },
      { address: activeAccount.address, signer: activeSigner },
      region,
      {
        ready: () => toastInfo('Transaction was initiated.'),
        inBlock: () => toastInfo(`In Block`),
        finalized: () => {
          /** */
        },
        success: () => {
          toastSuccess('Successfully unwrapped the xc-region.');
          onSuccess();
        },
        error: () => {
          toastError(`Failed to unwrap the xc-region.`);
          setWorking(false);
        },
      }
    );
  };

  const approveRegionToContract = useCallback(
    async (region: Region, onSuccess: () => void) => {
      if (!activeAccount || !activeSigner) return;

      setStatusLabel('Approving region to the xc-region contract...');
      setWorking(true);
      approveNonWrappedRegion(
        {
          contractsApi,
          xcRegionsContract: contract,
          marketContract: undefined,
        },
        { address: activeAccount.address, signer: activeSigner },
        region,
        CONTRACT_XC_REGIONS,
        {
          ready: () => toastInfo('Transaction was initiated.'),
          inBlock: () => toastInfo(`In Block`),
          finalized: () => {
            /** */
          },
          success: () => {
            toastSuccess('Successfully approved the region.');
            onSuccess();
          },
          error: () => {
            toastError(`Failed to approve the region.`);
            setWorking(false);
          },
        }
      );
    },
    [
      activeAccount,
      contractsApi,
      activeSigner,
      contract,
      toastError,
      toastInfo,
      toastSuccess,
    ]
  );

  const initMetadata = useCallback(
    async (region: Region) => {
      if (!activeAccount || !activeSigner) return;

      setStatusLabel('Initializing metadata...');
      setWorking(true);
      initRegionMetadata(
        {
          contractsApi,
          xcRegionsContract: contract,
          marketContract: undefined,
        },
        { address: activeAccount.address, signer: activeSigner },
        region,
        {
          ready: () => toastInfo('Transaction was initiated.'),
          inBlock: () => toastInfo(`In Block`),
          finalized: () => setWorking(false),
          success: () => {
            toastSuccess('Successfully initialized region metadata.');
            setStatusLabel('');
            fetchRegions();
          },
          error: () => {
            toastError(`Failed to initialize the region metadata.`);
            setWorking(false);
          },
        }
      );
    },
    [
      activeAccount,
      activeSigner,
      contractsApi,
      contract,
      toastError,
      toastSuccess,
      toastInfo,
      fetchRegions,
    ]
  );

  const startInitializationProcess = useCallback(
    async (region: Region) => {
      approveRegionToContract(region, () => initMetadata(region));
    },
    [approveRegionToContract, initMetadata]
  );

  const handleNonWrappedRegions = useCallback(
    async (coretimeApi: ApiPromise, activeAccount: InjectedAccount) => {
      const nonWrappedRegions = await getNonWrappedRegions(
        {
          contractsApi,
          xcRegionsContract: contract,
          marketContract: undefined,
        },
        coretimeApi,
        activeAccount.address
      );
      nonWrappedRegions.forEach((region) => {
        startInitializationProcess(region);
      });
    },
    [contract, contractsApi, startInitializationProcess]
  );

  useEffect(() => {
    let intervalId: any;
    if (!working) {
      intervalId = setInterval(() => {
        coretimeApi &&
          activeAccount &&
          handleNonWrappedRegions(coretimeApi, activeAccount);
      }, 5000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [working, activeAccount, coretimeApi, handleNonWrappedRegions]);

  return (
    <Box>
      <Box>
        <Typography
          variant='subtitle2'
          sx={{ color: theme.palette.text.secondary }}
        >
          Cross-chain transfer regions
        </Typography>
        <Typography
          variant='subtitle1'
          sx={{ color: theme.palette.text.primary }}
        >
          Cross-Chain Transfer
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

export default TransferPage;
