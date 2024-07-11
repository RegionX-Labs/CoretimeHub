import ArrowDownward from '@mui/icons-material/ArrowDownwardOutlined';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { Keyring } from '@polkadot/api';
import { Region } from 'coretime-utils';
import { useRouter } from 'next/router';
import { useState } from 'react';

import theme from '@/utils/muiTheme';
import {
  coretimeFromRegionXTransfer,
  coretimeToRegionXTransfer,
  transferTokensFromCoretimeToRelay,
  transferTokensFromRegionXToRelay,
  transferTokensFromRelayToCoretime,
  transferTokensFromRelayToRegionX,
} from '@/utils/transfers/crossChain';
import {
  transferNativeToken,
  transferRegionOnCoretimeChain,
} from '@/utils/transfers/native';

import {
  AddressInput,
  AmountInput,
  Balance,
  ChainSelector,
  IsmpRegionCard,
  ProgressButton,
  RegionMetaCard,
  RegionSelector,
} from '@/components';
import AssetSelector from '@/components/Elements/Selectors/AssetSelector';

import { EXPERIMENTAL } from '@/consts';
import { useAccounts } from '@/contexts/account';
import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { useRegionXApi } from '@/contexts/apis/RegionXApi';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import {
  AssetType,
  ChainType,
  CORETIME_DECIMALS,
  ISMPRecordStatus,
  NetworkType,
  RegionLocation,
  RegionMetadata,
} from '@/models';

const TransferPage = () => {
  const router = useRouter();

  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();

  const { toastError, toastInfo, toastWarning, toastSuccess } = useToast();
  const {
    state: { api: coretimeApi, apiState: coretimeApiState, symbol },
  } = useCoretimeApi();
  const {
    state: { api: regionXApi, apiState: regionxApiState },
  } = useRegionXApi();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const { network } = useNetwork();
  const { regions, fetchRegions } = useRegions();

  const [filteredRegions, setFilteredRegions] = useState<Array<RegionMetadata>>(
    []
  );
  const [working, setWorking] = useState(false);

  const [newOwner, setNewOwner] = useState('');
  const [originChain, setOriginChain] = useState<ChainType>(ChainType.RELAY);
  const [destinationChain, setDestinationChain] = useState<ChainType>(
    ChainType.CORETIME
  );
  const [selectedRegion, setSelectedRegion] = useState<RegionMetadata | null>(
    null
  );

  const [asset, setAsset] = useState<AssetType>(AssetType.TOKEN);
  const [transferAmount, setTransferAmount] = useState<number | undefined>();

  const enableRegionX = network === NetworkType.ROCOCO || EXPERIMENTAL;

  const defaultHandler = {
    ready: () => toastInfo('Transaction was initiated'),
    inBlock: () => toastInfo('In Block'),
    finalized: () => setWorking(false),
    success: () => {
      toastSuccess('Successfully transferred');
    },
    fail: () => {
      toastError('Failed to transfer');
    },
    error: (e: any) => {
      toastError(`Failed to transfer ${e}`);
      setWorking(false);
    },
  };

  const handleOriginChange = (newOrigin: ChainType) => {
    setOriginChain(newOrigin);
    setFilteredRegions(
      regions.filter(
        (r) =>
          r.location ===
          (newOrigin === ChainType.CORETIME
            ? RegionLocation.CORETIME_CHAIN
            : RegionLocation.REGIONX_CHAIN)
      )
    );
    if (newOrigin === ChainType.RELAY) setAsset(AssetType.TOKEN);
  };

  const handleTransfer = async () => {
    if (!activeAccount || !activeSigner) {
      toastWarning('Connect wallet first');
      return;
    }

    setWorking(true);
    if (asset === AssetType.REGION) {
      handleRegionTransfer();
    } else if (asset === AssetType.TOKEN) {
      handleTokenTransfer();
    }
  };

  const handleTokenTransfer = async () => {
    if (!activeAccount || !activeSigner) {
      toastError('Please connect your wallet and try again');
      return;
    }
    if (!originChain || !destinationChain) return;

    let api = null;

    if (originChain === ChainType.CORETIME) {
      if (!coretimeApi || coretimeApiState !== ApiState.READY) {
        toastError('Not connected to the coretime chain');
        return;
      }
      api = coretimeApi;
    } else if (originChain === ChainType.RELAY) {
      if (!relayApi || relayApiState !== ApiState.READY) {
        toastError('Not connected to the relay chain');
        return;
      }
      api = relayApi;
    } else {
      // RegionX
      if (!enableRegionX) {
        toastWarning('Currently not supported');
        return;
      }
      if (!regionXApi || regionxApiState !== ApiState.READY) {
        toastError('Not connected to the RegionX chain');
        return;
      }
      api = regionXApi;
    }
    if (!api) return;

    if (transferAmount === undefined) {
      toastWarning('Please input the amount');
      return;
    }
    if (!newOwner) {
      toastError('Recipient must be selected');
      return;
    }
    const amount = transferAmount * Math.pow(10, CORETIME_DECIMALS);
    if (originChain === destinationChain) {
      transferNativeToken(
        api,
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

      if (
        (originChain === ChainType.CORETIME &&
          destinationChain === ChainType.REGIONX) ||
        (originChain === ChainType.REGIONX &&
          destinationChain === ChainType.CORETIME)
      ) {
        toastWarning('Not supported');
        return;
      }

      (originChain === ChainType.CORETIME
        ? transferTokensFromCoretimeToRelay
        : originChain === ChainType.REGIONX
        ? transferTokensFromRegionXToRelay
        : destinationChain === ChainType.CORETIME
        ? transferTokensFromRelayToCoretime
        : transferTokensFromRelayToRegionX
      ).call(
        this,
        api,
        { address: activeAccount.address, signer: activeSigner },
        amount.toString(),
        receiverKeypair.pairs[0].publicKey,
        defaultHandler
      );
    }
  };

  const handleRegionTransfer = async () => {
    if (!activeAccount || !activeSigner) return;
    if (!selectedRegion) {
      toastError('Select a region');
      return;
    }

    if (!coretimeApi || coretimeApiState !== ApiState.READY) {
      toastError('Not connected to the Coretime chain');
      return;
    }

    if (originChain === destinationChain) {
      originChain === ChainType.CORETIME
        ? await transferCoretimeRegion(selectedRegion.region)
        : toastWarning('Currently not supported');
    } else if (
      originChain === ChainType.CORETIME &&
      destinationChain === ChainType.REGIONX
    ) {
      if (!enableRegionX) toastWarning('Currently not supported');
      else {
        const receiverKeypair = new Keyring();
        receiverKeypair.addFromAddress(
          newOwner ? newOwner : activeAccount.address
        );
        coretimeToRegionXTransfer(
          coretimeApi,
          { address: activeAccount.address, signer: activeSigner },
          selectedRegion.rawId,
          receiverKeypair.pairs[0].publicKey,
          {
            ...defaultHandler,
            success: () => {
              toastSuccess('Successfully transferred.');
              fetchRegions();
            },
          }
        );
      }
    } else if (
      originChain === ChainType.REGIONX &&
      destinationChain === ChainType.CORETIME
    ) {
      if (!enableRegionX || !regionXApi || regionxApiState !== ApiState.READY) {
        toastWarning('Currently not supported');
        return;
      }

      const receiverKeypair = new Keyring();
      receiverKeypair.addFromAddress(
        newOwner ? newOwner : activeAccount.address
      );
      coretimeFromRegionXTransfer(
        regionXApi,
        { address: activeAccount.address, signer: activeSigner },
        selectedRegion.rawId,
        receiverKeypair.pairs[0].publicKey,
        {
          ...defaultHandler,
          success: () => {
            toastSuccess('Successfully transferred.');
            fetchRegions();
          },
        }
      );
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

    transferRegionOnCoretimeChain(
      coretimeApi,
      region,
      activeSigner,
      activeAccount.address,
      newOwner ?? activeAccount.address,
      defaultHandler
    );
  };

  const onHome = () => {
    router.push({
      pathname: '/',
      query: { network },
    });
  };

  return (
    <Box sx={{ maxHeight: 'calc(100% - 2rem)' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
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
        <Balance rcBalance ctBalance rxRcCurrencyBalance />
      </Box>
      <Box
        width='60%'
        margin='0.5rem auto'
        sx={{
          overflowY: 'auto',
          '::-webkit-scrollbar': { display: 'none' },
          height: '100%',
        }}
      >
        <Paper
          sx={{
            padding: '2rem',
            borderRadius: '2rem',
            mb: '2rem',
            boxShadow: 'none',
          }}
        >
          <Stack margin='0.5rem 0' direction='column' gap='1rem'>
            <Typography
              sx={{ color: theme.palette.common.black, fontSize: '1.25rem' }}
            >
              Origin chain:
            </Typography>
            <ChainSelector chain={originChain} setChain={handleOriginChange} />
          </Stack>
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

        {selectedRegion && (
          <Box
            sx={{
              transform: 'scale(0.9)',
              transformOrigin: 'center',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {selectedRegion.status === ISMPRecordStatus.AVAILABLE ? (
              <RegionMetaCard regionMetadata={selectedRegion} />
            ) : (
              <IsmpRegionCard regionMetadata={selectedRegion} />
            )}
          </Box>
        )}
        <Stack
          margin='0.5rem 0'
          direction='column'
          gap={0.5}
          alignItems='center'
        >
          <Typography>Transfer</Typography>
          <ArrowDownward />
        </Stack>
        <Paper
          sx={{
            padding: '2rem',
            borderRadius: '2rem',
            mt: '2rem',
            boxShadow: 'none',
          }}
        >
          <Stack direction='column' gap={1}>
            <AddressInput
              address={newOwner}
              onChange={setNewOwner}
              label='Transfer to'
            />
          </Stack>
          {asset === AssetType.TOKEN &&
            originChain !== ChainType.NONE &&
            destinationChain !== ChainType.NONE && (
              <Stack margin='2em 0' direction='column' gap={1}>
                <AmountInput
                  amount={transferAmount}
                  setAmount={setTransferAmount}
                  currency={symbol}
                  caption='Transfer amount'
                />
              </Stack>
            )}
        </Paper>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: '2rem',
            pb: '1rem',
          }}
        >
          <Button
            variant='outlined'
            sx={{
              borderRadius: 100,
              bgcolor: theme.palette.common.white,
              textTransform: 'capitalize',
            }}
            onClick={onHome}
          >
            &lt; Home
          </Button>
          <ProgressButton
            label='Transfer'
            onClick={handleTransfer}
            loading={working}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default TransferPage;
