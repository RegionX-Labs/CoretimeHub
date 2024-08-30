import {
  Backdrop,
  Box,
  CircularProgress,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

import { useRenewableParachains } from '@/hooks/renewableParas';

import { Balance } from '@/components';

import { ContextStatus } from '@/models';
import { SelectParachain } from './select';
import { RenewableParaInfo } from './info';
import { RenewAction } from './action';

const Renewal = () => {
  const theme = useTheme();

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const { status, parachains } = useRenewableParachains();

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
          <SelectParachain activeIdx={activeIdx} parachains={parachains} setActiveIdx={setActiveIdx} />
          <RenewableParaInfo parachain={parachains[activeIdx]} />
          <RenewAction parachain={parachains[activeIdx]} />
        </Paper>
      </Box>
    </>
  );
};

export default Renewal;
