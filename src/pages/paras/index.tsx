import { Backdrop, Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { Button } from '@region-x/components';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { useParasInfo } from '@/hooks';

import { ParachainTable, RegisterModal, ReserveModal } from '@/components';

import { useNetwork } from '@/contexts/network';
import { useSettings } from '@/contexts/settings';
import { ParachainInfo } from '@/models';

const ParachainManagement = () => {
  const theme = useTheme();

  const router = useRouter();

  const { network } = useNetwork();
  const { watchList, setWatchList } = useSettings();
  const {
    loading,
    parachains,
    config: { nextParaId, reservationCost, dataDepositPerByte, maxCodeSize },
  } = useParasInfo();

  const [watchAll, watchAllParas] = useState(true);
  const [paras2Show, setParas2Show] = useState<ParachainInfo[]>([]);
  const [paraId2Reg, setParaId2Reg] = useState(0);

  const [reserveModalOpen, openReserveModal] = useState(false);
  const [registerModalOpen, openRegisterModal] = useState(false);

  // Register a parathread
  const onRegister = (paraId: number) => {
    setParaId2Reg(paraId);
    openRegisterModal(true);
  };

  // Renew coretime with the given para id
  const onRenew = (paraId: number, core: number) => {
    router.push({
      pathname: 'renew',
      query: { network, paraId, core },
    });
  };

  // Upgrade a parathread to parachain
  const onUpgrade = (_paraId: number) => {
    router.push({
      pathname: 'purchase',
      query: { network },
    });
  };

  // Buy coretime for the given parachain
  const onBuy = () => {
    router.push({
      pathname: 'purchase',
      query: { network },
    });
  };

  const onWatch = (id: number, watching: boolean) => {
    const newList = watchList.filter(
      (value) => JSON.stringify(value) !== JSON.stringify({ network, paraId: id })
    );
    if (watching) newList.push({ network, paraId: id });
    setWatchList(newList);
  };

  useEffect(() => {
    const parasWithWatchInfo = parachains.map((para) => ({
      ...para,
      watching:
        watchList.findIndex(
          (w) => JSON.stringify(w) === JSON.stringify({ network, paraId: para.id })
        ) >= 0,
    }));
    const filtered = parasWithWatchInfo.filter((para) =>
      watchAll ? true : para.watching === true
    );

    setParas2Show(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parachains, watchList, watchAll, network]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant='subtitle1' sx={{ color: theme.palette.common.black }}>
            Parachain Dashboard
          </Typography>
          <Typography variant='subtitle2' sx={{ color: theme.palette.text.primary }}>
            Watch parachains state, register and manage parachains
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '1.5rem', height: '2.75rem' }}>
          <Button
            color={watchAll ? 'yellowDark' : 'greenPrimary'}
            onClick={() => watchAllParas((prev) => !prev)}
          >
            Watchlist Only
          </Button>
          <Button onClick={() => openReserveModal(true)}>Reserve New Para</Button>
        </Box>
      </Box>
      {loading ? (
        <Backdrop open>
          <CircularProgress />
        </Backdrop>
      ) : (
        <Box sx={{ mt: '2rem', mb: '1rem', overflowY: 'auto' }}>
          <ParachainTable
            parachains={paras2Show}
            handlers={{ onBuy, onRenew, onRegister, onUpgrade, onWatch }}
          />
          <ReserveModal
            open={reserveModalOpen}
            onClose={() => openReserveModal(false)}
            paraId={nextParaId}
            reservationCost={reservationCost}
          />
          <RegisterModal
            open={registerModalOpen}
            onClose={() => openRegisterModal(false)}
            paraId={paraId2Reg}
            dataDepositPerByte={dataDepositPerByte}
            maxCodeSize={maxCodeSize}
          />
        </Box>
      )}
    </Box>
  );
};

export default ParachainManagement;
