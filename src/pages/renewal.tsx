import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

import useBalance from '@/hooks/balance';
import { useRenewableParachains } from '@/hooks/useRenewableParas';
import { formatBalance, sendTx } from '@/utils/functions';

import { ProgressButton } from '@/components';
import Balance from '@/components/Elements/Balance';

import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useToast } from '@/contexts/toast';

const Renewal = () => {
  const theme = useTheme();

  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const { coretimeBalance, relayBalance } = useBalance();
  const { loading, parachains } = useRenewableParachains();
  const {
    state: { api, symbol },
  } = useCoretimeApi();
  const { toastError, toastInfo, toastSuccess } = useToast();

  const [paraId, setParaId] = useState<number>(0);
  const [working, setWorking] = useState(false);

  const defaultHandler = {
    ready: () => toastInfo('Transaction was initiated.'),
    inBlock: () => toastInfo(`In Block`),
    finalized: () => setWorking(false),
    success: () => {
      toastSuccess('Successfully renewed the selected parachain.');
    },
    error: () => {
      toastError(`Failed to renew the selected parachain.`);
      setWorking(false);
    },
  };

  const handleRenew = () => {
    if (!activeAccount || !api || !activeSigner) return;

    const { core } = parachains[paraId];

    const txRenewal = api.tx.broker.renew(core);

    sendTx(txRenewal, activeAccount.address, activeSigner, defaultHandler);
  };

  return loading ? (
    <Backdrop open>
      <CircularProgress />
    </Backdrop>
  ) : parachains.length === 0 ? (
    <Typography>There are no renewable parachains.</Typography>
  ) : (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Renew a parachain
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Renew a parachain
          </Typography>
        </Box>
        <Balance
          coretimeBalance={coretimeBalance}
          relayBalance={relayBalance}
          symbol={symbol}
        />
      </Box>

      <Stack
        direction='column'
        gap={1}
        margin='1rem 0'
        width='60%'
        sx={{ mx: 'auto' }}
      >
        <Typography
          variant='subtitle1'
          sx={{ color: theme.palette.common.black }}
        >
          Select a parachain to renew.
        </Typography>
        <FormControl fullWidth sx={{ mt: '1rem' }}>
          <InputLabel id='label-parachain-select'>Parachain</InputLabel>
          <Select
            labelId='label-parachain-select'
            label='Parachain'
            value={paraId}
            onChange={(e) => setParaId(Number(e.target.value))}
          >
            {parachains.map(({ paraID }, index) => (
              <MenuItem key={index} value={index}>
                {paraID}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction='column' alignItems='center' mt={'2rem'} gap='1rem'>
          <Box>{`Core number: ${parachains[paraId].core}`}</Box>
          <Box>{`Renewal price: ${formatBalance(
            parachains[paraId].price.toString(),
            false
          )} ${symbol}`}</Box>
        </Stack>
        <Stack
          direction='row'
          gap='1rem'
          alignItems='center'
          justifyContent='flex-end'
        >
          <Link href='/'>
            <Button variant='outlined'>Home</Button>
          </Link>
          <ProgressButton
            label='Renew'
            onClick={handleRenew}
            loading={working}
          />
        </Stack>
      </Stack>
    </>
  );
};
export default Renewal;
