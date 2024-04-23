import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import Image from 'next/image';

import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ChainType, NetworkType } from '@/models';

interface ChainSelectorProps {
  chain: ChainType;
  setChain: (_: ChainType) => void;
}

import {
  Kusama,
  KusamaCoretime,
  RegionX,
  Rococo,
  RococoCoretime,
} from '@/assets/networks';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';

const coretimeIcons = {
  [NetworkType.NONE]: RococoCoretime,
  [NetworkType.KUSAMA]: KusamaCoretime,
  [NetworkType.ROCOCO]: RococoCoretime,
};

const relayIcons = {
  [NetworkType.NONE]: Rococo,
  [NetworkType.KUSAMA]: Kusama,
  [NetworkType.ROCOCO]: Rococo,
};

export const ChainSelector = ({ chain, setChain }: ChainSelectorProps) => {
  const { network } = useNetwork();
  const {
    state: { name: coretimeChain, apiState: coretimeState },
  } = useCoretimeApi();
  const {
    state: { name: relayChain, apiState: relayState },
  } = useRelayApi();

  const menuItems = [
    {
      icon: relayIcons[network],
      label: relayChain,
      value: ChainType.RELAY,
      loading: coretimeState !== ApiState.READY,
    },
    {
      icon: coretimeIcons[network],
      label: coretimeChain,
      value: ChainType.CORETIME,
      loading: relayState !== ApiState.READY,
    },

    {
      icon: RegionX,
      label: 'RegionX Chain',
      value: ChainType.REGIONX,
    },
  ];
  return (
    <FormControl fullWidth>
      <InputLabel id='origin-selector-label'>Chain</InputLabel>
      <Select
        labelId='origin-selector-label'
        id='origin-selector'
        value={chain}
        label='Origin'
        onChange={(e) => setChain(e.target.value as ChainType)}
      >
        {menuItems.map(({ icon, label, value, loading }, index) => (
          <MenuItem value={value} key={index}>
            <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Image
                src={icon}
                alt='icon'
                style={{ width: '2rem', height: '2rem', borderRadius: '100%' }}
              />
              {loading ? (
                <CircularProgress size={'1.5rem'} />
              ) : (
                <Typography sx={{ lineHeight: 1.5, fontSize: '1.25rem' }}>
                  {label}
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
