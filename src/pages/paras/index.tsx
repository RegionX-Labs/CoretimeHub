import {
  Backdrop,
  Box,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { ActionButton, RegisterModal, ReserveModal } from '@/components';

import { useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';

type ParaState = 'Parathread' | 'Parachain';

type ParachainInfo = {
  id: number;
  state: ParaState;
};

const ParachainManagement = () => {
  const theme = useTheme();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();

  const [watchAll, watchAllParas] = useState(true);
  const [loading, setLoading] = useState(false);

  const [parachains, setParachains] = useState<ParachainInfo[]>([]);
  const [nextParaId, setNextParaId] = useState<number>(0);
  const [reservationCost, setReservationCost] = useState<string>('0');

  const [reserveModalOpen, openReserveModal] = useState(false);
  const [registerModalOpen, openRegisterModal] = useState(false);

  useEffect(() => {
    const asyncLoad = async () => {
      if (relayApiState !== ApiState.READY || !relayApi) return;
      setLoading(true);

      const fetchParachainList = async () => {
        const parasRaw = await relayApi.query.paras.paraLifecycles.entries();
        const paras: ParachainInfo[] = [];
        for (const [key, value] of parasRaw) {
          const [strId] = key.toHuman() as [string];
          const id = parseInt(strId.replace(/,/g, ''));
          const state = value.toString();
          paras.push({ id, state } as ParachainInfo);
        }
        paras.sort((a, b) => a.id - b.id);

        setParachains(paras);
      };

      const fetchNextParaId = async () => {
        const idRaw = await relayApi.query.registrar.nextFreeParaId();
        const id = idRaw.toPrimitive() as number;
        setNextParaId(id);
      };

      const fetchReservationCost = () => {
        setReservationCost(relayApi.consts.registrar.paraDeposit.toString());
      };

      await Promise.all([
        fetchParachainList(),
        fetchNextParaId(),
        fetchReservationCost(),
      ]);

      setLoading(false);
    };

    asyncLoad();
  }, [relayApiState, relayApi]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
        <Box sx={{ display: 'flex', gap: '2rem', height: '3.25rem' }}>
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
              background: theme.palette.common.white,
              border: `1px solid ${theme.palette.grey['200']}`,
              padding: '0.25rem 1.25rem',
              borderRadius: '5rem',
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
        <Box sx={{ mt: '1rem', overflowY: 'auto' }}>
          <div>{parachains.length}</div>
          {parachains.map(({ id, state }, index) => (
            <div key={index}>
              {id} - {state}
            </div>
          ))}
          <ReserveModal
            open={reserveModalOpen}
            onClose={() => openReserveModal(false)}
            paraId={nextParaId}
            reservationCost={reservationCost}
          />
          <RegisterModal
            open={registerModalOpen}
            onClose={() => openRegisterModal(false)}
            paraId={0}
            regCost='0'
          />
        </Box>
      )}
    </Box>
  );
};

export default ParachainManagement;
