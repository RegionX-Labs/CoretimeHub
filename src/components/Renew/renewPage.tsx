import { Backdrop, Box, CircularProgress, Paper, Typography, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useRenewableParachains } from '@/hooks/renewableParas';

import { Balance } from '@/components';

import { ContextStatus } from '@/models';

import { RenewAction } from './action';
import { RenewableParaInfo } from './info';
import { SelectParachain } from './select';

const Renewal = () => {
  const theme = useTheme();

  const router = useRouter();
  const { network } = router.query;

  const [activeIndex, setActiveIndex] = useState(0);
  const [renewalEnabled, setRenewalEnabled] = useState<boolean>(true);
  const { status, parachains } = useRenewableParachains();

  useEffect(() => {
    if (parachains.length === 0) return;

    // Intentionally set to -1 so that the user gets rerouted if core is not set.
    const core = router.query.core ? Number(router.query.core) : -1;
    const paraId = router.query.paraId ? Number(router.query.paraId) : -1;

    const index = parachains.findIndex((p) => p.core === core && p.paraId === paraId);

    if (index >= 0) {
      setActiveIndex(index);
    } else {
      router.push({
        pathname: '/renew',
        query: { network, core: parachains[0].core },
      });
    }
  }, [router.query, parachains]);

  return status !== ContextStatus.LOADED ? (
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
          <Typography variant='subtitle1' sx={{ color: theme.palette.common.black }}>
            Renew a parachain
          </Typography>
          <Typography variant='subtitle2' sx={{ color: theme.palette.text.primary }}>
            Renew a parachain
          </Typography>
        </Box>
        <Balance ctBalance />
      </Box>

      <Box sx={{ width: '60%', margin: '0 auto' }}>
        <Paper
          sx={{
            padding: '2rem',
            borderRadius: '2rem',
            mt: '2rem',
            boxShadow: 'none',
          }}
        >
          <SelectParachain parachains={parachains} />
          <RenewableParaInfo
            parachain={parachains[activeIndex]}
            setRenewalEnabled={setRenewalEnabled}
          />
          <RenewAction parachain={parachains[activeIndex]} enabled={renewalEnabled} />
        </Paper>
      </Box>
    </>
  );
};

export default Renewal;
