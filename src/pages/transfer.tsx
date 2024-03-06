import ArrowDownward from '@mui/icons-material/ArrowDownwardOutlined';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  DialogActions,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useContract, useInkathon } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';
import { useEffect, useState } from 'react';

import theme from '@/utils/muiTheme';
import {
  transferRegionOnContractsChain,
  transferRegionOnCoretimeChain,
} from '@/utils/native/transfer';

import { RegionCard } from '@/components';

import { useCoretimeApi } from '@/contexts/apis';
import { CONTRACT_XC_REGIONS } from '@/contexts/apis/consts';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import XcRegionsMetadata from '@/contracts/xc_regions.json';
import { RegionLocation, RegionMetadata } from '@/models';
import {
  contractsToCoretimeTransfer,
  coretimeToContractsTransfer,
} from '@/utils/crossChain/transfer';
import { Keyring } from '@polkadot/api';
import { approveNonWrappedRegion } from '@/utils/native/approve';
import { initRegionMetadata } from '@/utils/native/init';
import { getNonWrappedRegions } from '@/contexts/regions/xc';
import { removeXcRegionWrapper } from '@/utils/native/remove';

const Page = () => {
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

  useEffect(() => {
    let intervalId: any;
    if (!working) {
      intervalId = setInterval(() => {
        handleNonWrappedRegions();
      }, 5000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [working, activeAccount, coretimeApi]);

  const handleNonWrappedRegions = async () => {
    if (!activeAccount || !coretimeApi) return;
    console.log('hey');
    const nonWrappedRegions = await getNonWrappedRegions(
      { contractsApi, xcRegionsContract: contract, marketContract: undefined },
      coretimeApi,
      activeAccount.address
    );
    nonWrappedRegions.forEach((region) => {
      startInitializationProcess(region);
    });
  };

  const handleOriginChange = (newOrigin: string) => {
    setOriginChain(newOrigin);
    if (newOrigin === 'CoretimeChain')
      setFilteredRegions(
        regions.filter((r) => r.location == RegionLocation.CORETIME_CHAIN)
      );
    else {
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

    if (
      originChain === 'CoretimeChain' &&
      destinationChain === 'CoretimeChain'
    ) {
      transferCoretimeRegion(selectedRegion.region);
    } else if (
      originChain === 'ContractsChain' &&
      destinationChain === 'ContractsChain'
    ) {
      transferXcRegion(selectedRegion.region);
    } else {
      if (originChain === 'CoretimeChain') {
        transferFromCoretimeChain(selectedRegion.region);
      } else {
        transferFromContractsChain(selectedRegion.region);
      }
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
        success: () => {
          toastSuccess('Successfully transferred the region.');
        },
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
        success: () => {
          toastSuccess('Successfully transferred the region.');
        },
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
        finalized: () => {},
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

  const startInitializationProcess = async (region: Region) => {
    approveRegionToContract(region, () => initMetadata(region));
  };

  const approveRegionToContract = async (
    region: Region,
    onSuccess: () => void
  ) => {
    if (!activeAccount || !activeSigner || working) return;

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
        finalized: () => {},
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
  };

  const initMetadata = async (region: Region) => {
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
  };

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
      <Box width={'60%'} margin={'2em auto'}>
        <Stack margin={'1em 0'} direction='column' gap={1}>
          <Typography>Origin chain:</Typography>
          <ChainSelectorProps
            chain={originChain}
            setChain={handleOriginChange}
          />
        </Stack>
        <Stack margin={'1em 0'} direction='column' gap={1}>
          <Typography>Destination chain:</Typography>
          <ChainSelectorProps
            chain={destinationChain}
            setChain={setDestinationChain}
          />
        </Stack>
        {originChain && (
          <Stack margin={'1em 0'} direction='column' gap={1}>
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
        <Stack margin={'2em 0'} direction='column' gap={1} alignItems='center'>
          <Typography>Transfer</Typography>
          <ArrowDownward />
        </Stack>
        <Stack direction='column' gap={1}>
          <Typography>Transfer to:</Typography>
          <DestinationSelector
            destination={newOwner}
            setDestination={setNewOwner}
          />
        </Stack>
        {statusLabel && (
          <Alert severity='info' sx={{ marginY: '2em' }}>
            {statusLabel}
          </Alert>
        )}
        <Box margin={'2em 0'}>
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

interface RegionSelectorProps {
  regions: Array<RegionMetadata>;
  selectedRegion: RegionMetadata | null;
  handleRegionChange: (_indx: number) => void;
}

const RegionSelector = ({
  regions,
  selectedRegion,
  handleRegionChange,
}: RegionSelectorProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel id='destination-selector-label'>Region Name</InputLabel>
      <Select
        labelId='destination-selector-label'
        id='destination-selector'
        value={selectedRegion?.name}
        label='Destination'
        onChange={(e) => handleRegionChange(Number(e.target.value))}
      >
        {regions.map((region, indx) => (
          <MenuItem key={indx} value={indx}>
            {region.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

interface ChainSelectorProps {
  chain: string;
  setChain: (_: string) => void;
}

const ChainSelectorProps = ({ chain, setChain }: ChainSelectorProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel id='origin-selector-label'>Chain</InputLabel>
      <Select
        labelId='origin-selector-label'
        id='origin-selector'
        value={chain}
        label='Origin'
        onChange={(e) => setChain(e.target.value)}
      >
        <MenuItem value='CoretimeChain'>Coretime Chain</MenuItem>
        <MenuItem value='ContractsChain'>Contracts Chain</MenuItem>
      </Select>
    </FormControl>
  );
};

interface DestinationSelectorProps {
  setDestination: (_: string) => void;
  destination: string;
}

const DestinationSelector = ({
  setDestination,
  destination,
}: DestinationSelectorProps) => {
  const [destinationKind, setDestinationKind] = useState('Me');

  const handleDestinationKindChange = (event: any) => {
    setDestination('');
    setDestinationKind(event.target.value);
  };

  const handleOtherDestinationChange = (event: any) => {
    setDestination(event.target.value);
  };

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id='destination-selector-label'>Destination</InputLabel>
        <Select
          labelId='destination-selector-label'
          id='destination-selector'
          value={destinationKind}
          label='Destination'
          onChange={handleDestinationKindChange}
        >
          <MenuItem value='Me'>Me</MenuItem>
          <MenuItem value='Other'>Other</MenuItem>
        </Select>
      </FormControl>
      {destinationKind === 'Other' && (
        <TextField
          label='Destination'
          fullWidth
          margin='normal'
          value={destination}
          onChange={handleOtherDestinationChange}
        />
      )}
    </div>
  );
};

export default Page;
