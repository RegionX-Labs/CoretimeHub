import ArrowDownward from '@mui/icons-material/ArrowDownwardOutlined';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { AmountInput, Button } from '@region-x/components';
import { useRouter } from 'next/router';

import { useCoretimeApi, useRegionXApi, useRelayApi } from '@/contexts/apis';
import { useBalances } from '@/contexts/balance';
import { useNetwork } from '@/contexts/network';
import { useToast } from '@/contexts/toast';
import { AssetType, ChainType } from '@/models';

import { assetType } from './common';
import { useTransferState } from './contexts/transferState';
import { useTransferHandlers } from './hooks/useTransferHandlers';
import { AddressInput } from '../Elements';
import { getIcon } from '@/assets/networks';

const TransferActions = () => {
  const { transferAmount, handleTransfer, working, newOwner, setNewOwner, setTransferAmount } =
    useTransferHandlers();

  const {
    state: { ed: coretimeChainED },
  } = useCoretimeApi();
  const {
    state: { ed: _regionXChainED }, // This is for the native asset
  } = useRegionXApi();
  const {
    state: { symbol, decimals: relayTokenDecimals, ed: relayChainED },
  } = useRelayApi();

  const { originChain, destinationChain } = useTransferState();
  const { balance } = useBalances();

  const router = useRouter();
  const { network } = useNetwork();
  const { toastWarning } = useToast();

  const onHome = () => {
    router.push({
      pathname: '/',
      query: { network },
    });
  };

  const onTransfer = () => {
    if (assetType(originChain, destinationChain) === AssetType.REGION) {
      handleTransfer();
      return;
    }

    if (!transferAmount) {
      toastWarning('Please input the amount');
      return;
    }
    const _transferAmount = transferAmount * Math.pow(10, relayTokenDecimals);

    // Ensure the user has a sufficient balance:

    if (
      (originChain === ChainType.CORETIME &&
        balance.coretime - coretimeChainED < _transferAmount) ||
      (originChain === ChainType.REGIONX &&
        // ED is not really relevant since rc asset is not the native asset.
        balance.rxRcCurrencyBalance < _transferAmount) ||
      (originChain === ChainType.RELAY && balance.relay - relayChainED < _transferAmount)
    ) {
      toastWarning('Insufficient balance');
      return;
    }
    handleTransfer();
  };

  return (
    <Box width='50%' margin='0.5rem auto'>
      <Stack margin='0.5rem 0' direction='column' gap={0.5} alignItems='center'>
        <ArrowDownward />
      </Stack>
      <Paper
        sx={{
          padding: '2rem',
          borderRadius: '0.5rem',
          mt: '2rem',
          boxShadow: 'none',
        }}
      >
        <Stack direction='column' gap={1}>
          <AddressInput address={newOwner} onChange={setNewOwner} label='Transfer to' />
        </Stack>
        {assetType(originChain, destinationChain) === AssetType.TOKEN &&
          originChain !== ChainType.NONE &&
          destinationChain !== ChainType.NONE && (
            <Box margin='1em 0' gap={1} display='flex' width='100%' justifyContent='flex-start' alignItems='center'>
              <Typography width='20ch'>Transfer Amount: </Typography>
              <AmountInput
                onAmountChange={(a) => setTransferAmount(Number(a))}
                currencyOptions={[
                  {
                    value: symbol,
                    label: symbol,
                    icon: <img src={getIcon(network)?.src} style={{ width: '28px' }} />,
                  },
                ]}
                label=''
              />
            </Box>
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
        <Button color='dark' onClick={onHome}>
          Home
        </Button>
        <Button onClick={onTransfer} loading={working}>
          Transfer
        </Button>
      </Box>
    </Box>
  );
};

export default TransferActions;
