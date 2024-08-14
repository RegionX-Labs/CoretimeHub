import ArrowDownward from '@mui/icons-material/ArrowDownwardOutlined';
import { Box, Button, Paper, Stack } from '@mui/material';
import { useRouter } from 'next/router';

import theme from '@/utils/muiTheme';

import { ProgressButton } from '@/components/Elements/Buttons/ProgressButton';
import { AddressInput } from '@/components/Elements/Inputs/AddressInput';
import { AmountInput } from '@/components/Elements/Inputs/AmountInput';

import { useBalances } from '@/contexts/balance';
import { useNetwork } from '@/contexts/network';
import { useToast } from '@/contexts/toast';
import { AssetType, ChainType } from '@/models';

import { assetType } from './common';
import { useTransferState } from './contexts/transferState';
import { useTransferHandlers } from './hooks/useTransferHandlers';

const TransferActions = () => {
  const {
    transferAmount,
    handleTransfer,
    working,
    newOwner,
    setNewOwner,
    setTransferAmount,
  } = useTransferHandlers();

  const { symbol, originChain, destinationChain, relayTokenDecimals } = useTransferState();
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
    if (!transferAmount) {
      toastWarning('Please input the amount');
      return;
    }
    const _transferAmount = transferAmount * Math.pow(10, relayTokenDecimals);

    // Ensure the user has a sufficient balance:
    // TODO: check for existential deposit
    if (
      (originChain === ChainType.CORETIME &&
        balance.coretime < _transferAmount) ||
      (originChain === ChainType.REGIONX &&
        balance.rxRcCurrencyBalance < _transferAmount) ||
      (originChain === ChainType.RELAY && balance.relay < _transferAmount)
    ) {
      toastWarning('Insufficient balance');
      return;
    }
    handleTransfer();
  };

  return (
    <Box width='60%' margin='0.5rem auto'>
      <Stack margin='0.5rem 0' direction='column' gap={0.5} alignItems='center'>
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
        {assetType(originChain, destinationChain) === AssetType.TOKEN &&
          originChain !== ChainType.NONE &&
          destinationChain !== ChainType.NONE && (
            <Stack margin='2em 0' direction='column' gap={1}>
              <AmountInput
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
          onClick={onTransfer}
          loading={working}
        />
      </Box>
    </Box>
  );
};

export default TransferActions;
