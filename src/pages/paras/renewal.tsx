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
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Status, useRenewableParachains } from '@/hooks/renewableParas';
import { getBalanceString, sendTx } from '@/utils/functions';

import { Balance, ProgressButton } from '@/components';

import chainData from '@/chaindata';
import { useAccounts } from '@/contexts/account';
import { useCoretimeApi } from '@/contexts/apis';
import { useBalances } from '@/contexts/balance';
import { useNetwork } from '@/contexts/network';
import { useToast } from '@/contexts/toast';

const Renewal = () => {
  const router = useRouter();
  const theme = useTheme();

  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const { balance } = useBalances();
  const { status, parachains } = useRenewableParachains();
  const {
    state: { api, decimals, symbol },
  } = useCoretimeApi();
  const { toastError, toastInfo, toastSuccess } = useToast();
  const { network } = useNetwork();

  const [activeIdx, setActiveIdx] = useState<number>(0);
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

    const { core } = parachains[activeIdx];

    const txRenewal = api.tx.broker.renew(core);

    sendTx(txRenewal, activeAccount.address, activeSigner, defaultHandler);
  };

  useEffect(() => {
    if (!router.isReady || status !== Status.LOADED || parachains.length === 0)
      return;
    const { query } = router;
    if (query['paraId'] === undefined) return;
    const paraId = parseInt(query['paraId'] as string);
    const index = parachains.findIndex((para) => para.paraID == paraId);
    if (index === -1) {
      toastError(`No renewable parachain found with ID = ${paraId}`);
      return;
    }
    setActiveIdx(index);
  }, [router, parachains, status, parachains.length, toastError]);

  return status === Status.LOADING ? (
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
          coretimeBalance={balance.coretime}
          relayBalance={balance.relay}
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
            value={activeIdx}
            onChange={(e) => setActiveIdx(Number(e.target.value))}
          >
            {parachains.map(({ paraID }, index) => (
              <MenuItem key={index} value={index}>
                {`${paraID} ${chainData[network][paraID] || ''}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction='column' alignItems='center' mt={'2rem'} gap='1rem'>
          <Typography variant='h6' color='black'>
            {`Core number: ${parachains[activeIdx].core}`}
          </Typography>
          <Typography color='black'>
            Renewal price: &nbsp;
            {getBalanceString(
              parachains[activeIdx].price.toString(),
              decimals,
              symbol
            )}
          </Typography>
        </Stack>
        <Stack
          direction='row'
          gap='1rem'
          alignItems='center'
          marginTop='2em'
          justifyContent='space-between'
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
