import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';

import { RenewableParachain } from '@/hooks';
import theme from '@/utils/muiTheme';

import { ParaDisplay } from '@/components';

import { useNetwork } from '@/contexts/network';

interface SelectParachainProps {
  parachains: RenewableParachain[];
}

export const SelectParachain = ({ parachains }: SelectParachainProps) => {
  const { network } = useNetwork();
  const router = useRouter();

  // Get coreId from query params.
  const core = router.query.core ? Number(router.query.core) : null;
  const paraId = router.query.paraId ? Number(router.query.paraId) : null;

  const onParaChange = (e: SelectChangeEvent) => {
    const selectedCoreId = core ? parachains[Number(e.target.value)].core : parachains[0].core;

    const selectedParaId = paraId
      ? parachains[Number(e.target.value)].paraId
      : parachains[0].paraId;

    // Update the URL with the new `core` query param
    router.push({
      pathname: '/renew',
      query: { network, paraId: selectedParaId, core: selectedCoreId },
    });
  };

  return (
    <Stack direction='column' gap={1} margin='1rem 0' width='75%' sx={{ mx: 'auto' }}>
      <Typography
        variant='h1'
        textAlign='center'
        sx={{ color: theme.palette.common.black, mb: '1rem' }}
      >
        Select a parachain to renew
      </Typography>
      <FormControl fullWidth sx={{ mt: '1rem' }}>
        <InputLabel id='label-parachain-select'>Parachain</InputLabel>
        <Select
          sx={{ borderRadius: '1rem' }}
          labelId='label-parachain-select'
          label='Parachain'
          value={parachains.findIndex((p) => p.core === core && p.paraId === paraId).toString()}
          onChange={onParaChange}
        >
          {parachains.map(({ paraId, core }, index) => (
            <MenuItem key={index} value={index.toString()}>
              <ParaDisplay {...{ network, paraId, core }} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};
