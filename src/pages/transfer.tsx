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
import { Keyring } from '@polkadot/api';
import { useInkathon } from '@scio-labs/use-inkathon';
import { Region } from 'coretime-utils';
import { useEffect, useState } from 'react';

import {
  transferTokensFromCoretimeToRelay,
  transferTokensFromRelayToCoretime,
} from '@/utils/crossChain/transfer';
import { fetchBalance } from '@/utils/functions';
import theme from '@/utils/muiTheme';
import {
  transferNativeToken,
  transferRegionOnCoretimeChain,
} from '@/utils/native/transfer';

import {
  AmountInput,
  ChainSelector,
  RecipientSelector,
  RegionCard,
  RegionSelector,
} from '@/components';
import Balance from '@/components/Elements/Balance';
import AssetSelector from '@/components/Elements/Selectors/AssetSelector';

import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import {
  Asset,
  CORETIME_DECIMALS,
  RegionLocation,
  RegionMetadata,
} from '@/models';

const TransferPage = () => {
  const { activeAccount, activeSigner } = useInkathon();

  const { toastError, toastInfo, toastWarning, toastSuccess } = useToast();
  const {
    state: { api: coretimeApi, apiState: coretimeApiState, symbol },
  } = useCoretimeApi();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
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

  const [asset, setAsset] = useState<Asset>('token');
  const [transferAmount, setTransferAmount] = useState('');

  const [coretimeBalance, setCoretimeBalance] = useState(0);
  const [relayBalance, setRelayBalance] = useState(0);

  const defaultHandler = {
    ready: () => toastInfo('Transaction was initiated.'),
    inBlock: () => toastInfo(`In Block`),
    finalized: () => setWorking(false),
    success: () => {
      getBalances();
      toastSuccess('Successfully transferred.');
    },
    error: () => {
      toastError(`Failed to transfer.`);
      setWorking(false);
    },
  };

  useEffect(() => {
    getBalances();
  }, [relayApi, relayApiState, coretimeApi, coretimeApiState, activeAccount]);

  const getBalances = async () => {
    if (
      !relayApi ||
      relayApiState !== ApiState.READY ||
      !coretimeApi ||
      coretimeApiState !== ApiState.READY ||
      !activeAccount
    )
      return;

    const rcBalance = await fetchBalance(relayApi, activeAccount.address);
    const ctBalance = await fetchBalance(coretimeApi, activeAccount.address);

    setRelayBalance(rcBalance);
    setCoretimeBalance(ctBalance);
  };

  useEffect(() => {
    setFilteredRegions(
      regions.filter((r) => r.location != RegionLocation.MARKET)
    );
  }, [regions]);

  const handleOriginChange = (newOrigin: string) => {
    setOriginChain(newOrigin);
    setFilteredRegions(
      regions.filter(
        (r) =>
          r.location ===
          (newOrigin === 'CoretimeChain'
            ? RegionLocation.CORETIME_CHAIN
            : RegionLocation.REGIONX_CHAIN)
      )
    );
  };

  const handleTransfer = async () => {
    if (!activeAccount || !activeSigner) {
      toastWarning('Connect wallet first');
      return;
    }
    if (asset === 'region') {
      handleRegionTransfer();
    } else if (asset === 'token') {
      handleTokenTransfer();
    }
  };

  const handleTokenTransfer = async () => {
    if (!activeAccount || !activeSigner) return;
    if (!originChain || !destinationChain) return;

    if (!coretimeApi) {
      toastError('Not connected to the Coretime chain');
      return;
    }
    if (!relayApi) {
      toastError('Not connected to the relay chain');
      return;
    }

    const amount = Number(transferAmount) * Math.pow(10, CORETIME_DECIMALS);
    if (originChain === destinationChain) {
      if (!newOwner) {
        toastError('Recipient must be selected');
        return;
      }
      transferNativeToken(
        originChain === 'CoretimeChain' ? coretimeApi : relayApi,
        activeSigner,
        activeAccount.address,
        newOwner,
        amount.toString(),
        defaultHandler
      );
    } else {
      const receiverKeypair = new Keyring();
      receiverKeypair.addFromAddress(
        newOwner ? newOwner : activeAccount.address
      );

      (originChain === 'CoretimeChain'
        ? transferTokensFromCoretimeToRelay
        : transferTokensFromRelayToCoretime
      ).call(
        this,
        originChain === 'CoretimeChain' ? coretimeApi : relayApi,
        { address: activeAccount.address, signer: activeSigner },
        amount.toString(),
        receiverKeypair.pairs[0].publicKey,
        defaultHandler
      );
    }
  };

  const handleRegionTransfer = async () => {
    if (!selectedRegion) {
      toastError('Select a region');
      return;
    }

    if (originChain === destinationChain) {
      originChain === 'CoretimeChain'
        ? await transferCoretimeRegion(selectedRegion.region)
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
      newOwner ?? activeAccount.address,
      defaultHandler
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
        <Balance
          symbol={symbol}
          coretimeBalance={coretimeBalance}
          relayBalance={relayBalance}
        />
      </Box>
      <Box width='60%' margin='2em auto'>
        <Stack margin='1em 0' direction='column' gap={1}>
          <AssetSelector symbol={symbol} asset={asset} setAsset={setAsset} />
        </Stack>
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
        {asset === 'region' && originChain && destinationChain && (
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
              transform: 'scale(0.9)',
              transformOrigin: 'center',
              display: 'flex',
              justifyContent: 'center',
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
        {asset === 'token' && originChain && destinationChain && (
          <Stack margin='2em 0' direction='column' gap={1}>
            <AmountInput
              amount={transferAmount}
              setAmount={setTransferAmount}
              currency={symbol}
              caption='Transfer amount'
            />
          </Stack>
        )}
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
