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

import styles from './index.module.scss';

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
  [NetworkType.KUSAMA]: KusamaCoretime,
  [NetworkType.ROCOCO]: RococoCoretime,
  [NetworkType.NONE]: '',
};

const relayIcons = {
  [NetworkType.KUSAMA]: Kusama,
  [NetworkType.ROCOCO]: Rococo,
  [NetworkType.NONE]: '',
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
        sx={{ borderRadius: '1rem' }}
        onChange={(e) => setChain(e.target.value as ChainType)}
      >
        {menuItems.map(({ icon, label, value, loading }, index) => (
          <MenuItem value={value} key={index}>
            <Box className={styles.chainItem}>
              <Image src={icon} alt='icon' className={styles.icon} />
              {loading ? (
                <CircularProgress size='1.5rem' />
              ) : (
                <Typography className={styles.label}>{label}</Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
