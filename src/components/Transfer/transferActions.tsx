import ArrowDownward from '@mui/icons-material/ArrowDownwardOutlined';
import { Box, Button, Paper, Stack } from '@mui/material';
import { useRouter } from 'next/router';

import theme from '@/utils/muiTheme';

import { ProgressButton } from '@/components/Elements/Buttons/ProgressButton';
import { AddressInput } from '@/components/Elements/Inputs/AddressInput';
import { AmountInput } from '@/components/Elements/Inputs/AmountInput';

import { useNetwork } from '@/contexts/network';
import { AssetType, ChainType } from '@/models';

import { assetType } from './common';
import { useTransferState } from './contexts/transferState';
import { useTransferHandlers } from './hooks/useTransferHandlers';

const TransferActions = () => {
  const { handleTransfer, working, newOwner, setNewOwner, setTransferAmount } =
    useTransferHandlers();

  const { originChain, destinationChain, symbol } = useTransferState();

  const router = useRouter();
  const { network } = useNetwork();

  const onHome = () => {
    router.push({
      pathname: '/',
      query: { network },
    });
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
          onClick={handleTransfer}
          loading={working}
        />
      </Box>
    </Box>
  );
};

export default TransferActions;
