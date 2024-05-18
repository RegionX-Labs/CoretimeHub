import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  Backdrop,
  Box,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { useParasInfo } from '@/hooks';

import {
  ActionButton,
  ParachainTable,
  RegisterModal,
  ReserveModal,
} from '@/components';

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
    fetchParaStates,
  } = useParasInfo();

  const [watchAll, watchAllParas] = useState(true);
  const [paras2Show, setParas2Show] = useState<ParachainInfo[]>([]);
  const [paraId2Reg, setParaId2Reg] = useState(0);
  const [search, setSearch] = useState('');

  const [reserveModalOpen, openReserveModal] = useState(false);
  const [registerModalOpen, openRegisterModal] = useState(false);

  // Register a parathread
  const onRegister = (paraId: number) => {
    setParaId2Reg(paraId);
    openRegisterModal(true);
  };

  // Renew coretime with the given para id
  const onRenew = (paraId: number) => {
    router.push({
      pathname: 'paras/renewal',
      query: { network, paraId },
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

  const onReserved = () => {
    openReserveModal(false);
    fetchParaStates();
  };

  const onRegistered = () => {
    openRegisterModal(false);
    fetchParaStates();
  };

  const onWatch = (id: number, watching: boolean) => {
    const newList = watchList.filter((value) => value !== id);
    if (watching) newList.push(id);
    setWatchList(newList);
  };

  useEffect(() => {
    const parasWithWatchInfo = parachains.map((para) => ({
      ...para,
      watching: watchList.includes(para.id),
    }));
    setParas2Show(
      parasWithWatchInfo.filter(
        (para) =>
          para.id.toString().includes(search) &&
          (watchAll ? true : para.watching === true)
      )
    );
  }, [parachains, watchList, watchAll, search]);

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
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Project Management
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Watch parachains state, register and manage parachains
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '1.5rem', height: '3.25rem' }}>
          <FormControlLabel
            control={
              <Switch
                color='success'
                checked={watchAll}
                onChange={(e) => watchAllParas(e.target.checked)}
              />
            }
            label='Watch all Paras'
            labelPlacement='start'
            sx={{
              color: theme.palette.common.black,
              padding: '0.25rem',
            }}
          />
          <TextField
            placeholder='Search by para id'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchOutlinedIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '.MuiInputBase-root': { borderRadius: '5rem', margin: 'auto 0' },
              '.MuiInputBase-input': {
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
              },
            }}
          />
          <ActionButton
            label='Reserve New Para'
            onClick={() => openReserveModal(true)}
          />
        </Box>
      </Box>
      {loading ? (
        <Backdrop open>
          <CircularProgress />
        </Backdrop>
      ) : (
        <Box sx={{ mt: '2rem', overflowY: 'auto' }}>
          <ParachainTable
            {...{
              parachains: paras2Show,
              handlers: { onBuy, onRenew, onRegister, onUpgrade, onWatch },
            }}
          />
          <ReserveModal
            open={reserveModalOpen}
            onClose={onReserved}
            paraId={nextParaId}
            reservationCost={reservationCost}
          />
          <RegisterModal
            open={registerModalOpen}
            onClose={onRegistered}
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
