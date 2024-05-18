import ArrowDownward from '@mui/icons-material/ArrowDownwardOutlined';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { Keyring } from '@polkadot/api';
import { Region } from 'coretime-utils';
import { useState } from 'react';

import {
  makeResponse,
  queryRequest,
  waitForRegionRecordRequestEvent,
} from '@/utils/ismp';
import theme from '@/utils/muiTheme';
import {
  coretimeFromRegionXTransfer,
  coretimeToRegionXTransfer,
  transferTokensFromCoretimeToRelay,
  transferTokensFromRelayToCoretime,
} from '@/utils/transfers/crossChain';
import {
  transferNativeToken,
  transferRegionOnCoretimeChain,
} from '@/utils/transfers/native';

import {
  AmountInput,
  Balance,
  ChainSelector,
  ProgressButton,
  RecipientInput,
  RegionMetaCard,
  RegionSelector,
} from '@/components';
import AssetSelector from '@/components/Elements/Selectors/AssetSelector';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { EXPERIMENTAL } from '@/contexts/apis/consts';
import { useRegionXApi } from '@/contexts/apis/RegionXApi';
import { ApiState } from '@/contexts/apis/types';
import { useBalances } from '@/contexts/balance';
import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import {
  AssetType,
  ChainType,
  CORETIME_DECIMALS,
  RegionLocation,
  RegionMetadata,
} from '@/models';

const TransferPage = () => {
  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();

  const { toastError, toastInfo, toastWarning, toastSuccess } = useToast();
  const {
    state: { api: coretimeApi, apiState: coretimeApiState, symbol },
  } = useCoretimeApi();
  const {
    state: { api: regionxApi, apiState: regionxApiState },
  } = useRegionXApi();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
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
  const [transferAmount, setTransferAmount] = useState('');

  const { balance } = useBalances();

  const defaultHandler = {
    ready: () => toastInfo('Transaction was initiated.'),
    inBlock: () => toastInfo(`In Block`),
    finalized: () => setWorking(false),
    success: () => {
      toastSuccess('Successfully transferred.');
    },
    error: () => {
      toastError(`Failed to transfer.`);
      setWorking(false);
    },
  };

  const ismpWaitAndRespond = async () => {
    if (
      !coretimeApi ||
      coretimeApiState != ApiState.READY ||
      !regionxApi ||
      regionxApiState != ApiState.READY ||
      !activeAccount ||
      !selectedRegion
    )
      return;

    try {
      const commitment = (await waitForRegionRecordRequestEvent(
        regionxApi,
        selectedRegion.region.getRegionId()
      )) as string;

      const request = await queryRequest(regionxApi, commitment);
      await makeResponse(
        regionxApi,
        coretimeApi,
        request,
        activeAccount.address,
        {
          ready: () => toastInfo('Fetching region record.'),
          inBlock: () => toastInfo(`In Block`),
          finalized: () => {
            /* */
          },
          success: () => {
            toastSuccess('Region record fetched.');
            fetchRegions();
          },
          error: () => {
            toastError(`Failed to fetch region record.`);
          },
        }
      );
    } catch {
      toastWarning(
        `Failed to fulfill ISMP request. Wait 5 minutes to re-request`
      );
    }
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
    if (!activeAccount || !activeSigner) return;
    if (!originChain || !destinationChain) return;

    if (!coretimeApi || coretimeApiState !== ApiState.READY) {
      toastError('Not connected to the Coretime chain');
      return;
    }
    if (!relayApi || relayApiState !== ApiState.READY) {
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
        originChain === ChainType.CORETIME ? coretimeApi : relayApi,
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

      (originChain === ChainType.CORETIME
        ? transferTokensFromCoretimeToRelay
        : transferTokensFromRelayToCoretime
      ).call(
        this,
        originChain === ChainType.CORETIME ? coretimeApi : relayApi,
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
      if (!EXPERIMENTAL) toastWarning('Currently not supported');
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
              ismpWaitAndRespond();
            },
          }
        );
      }
    } else if (
      originChain === ChainType.REGIONX &&
      destinationChain === ChainType.CORETIME
    ) {
      if (!EXPERIMENTAL || !regionxApi || regionxApiState !== ApiState.READY) {
        toastWarning('Currently not supported');
        return;
      }

      const receiverKeypair = new Keyring();
      receiverKeypair.addFromAddress(
        newOwner ? newOwner : activeAccount.address
      );
      coretimeFromRegionXTransfer(
        regionxApi,
        { address: activeAccount.address, signer: activeSigner },
        selectedRegion.rawId,
        receiverKeypair.pairs[0].publicKey,
        defaultHandler
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

  return (
    <Box>
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
        <Balance
          coretimeBalance={balance.coretime}
          relayBalance={balance.relay}
        />
      </Box>
      <Box
        width='60%'
        margin='2rem auto 0 auto'
        sx={{
          overflowY: 'auto',
          '::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Stack margin='0.5rem 0' direction='column' gap={1}>
          <Typography
            sx={{ color: theme.palette.common.black, fontSize: '1.25rem' }}
          >
            Origin chain:
          </Typography>
          <ChainSelector chain={originChain} setChain={handleOriginChange} />
        </Stack>
        <Stack margin='0.5rem 0' direction='column' gap={1}>
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
            <RegionMetaCard regionMetadata={selectedRegion} />
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
        <Stack direction='column' gap={1}>
          <Typography
            sx={{ color: theme.palette.common.black, fontSize: '1.25rem' }}
          >
            Transfer to:
          </Typography>
          <RecipientInput recipient={newOwner} setRecipient={setNewOwner} />
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
        <Box
          margin='2rem 0 0 0'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href='/'>
            <Button
              variant='outlined'
              sx={{
                borderRadius: 100,
                bgcolor: theme.palette.common.white,
                textTransform: 'capitalize',
              }}
            >
              Home
            </Button>
          </Link>
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
