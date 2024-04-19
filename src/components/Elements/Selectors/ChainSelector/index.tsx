import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import Image from 'next/image';

import CoretimeIcon from '@/assets/networks/coretime.png';
import KusamaIcon from '@/assets/networks/kusama.png';
import RegionXIcon from '@/assets/networks/regionx.png';

interface ChainSelectorProps {
  chain: string;
  setChain: (_: string) => void;
}

export const ChainSelector = ({ chain, setChain }: ChainSelectorProps) => {
  const menuItems = [
    {
      icon: KusamaIcon,
      label: 'Relay Chain',
      value: 'RelayChain',
    },
    {
      icon: CoretimeIcon,
      label: 'Coretime Chain',
      value: 'CoretimeChain',
    },

    {
      icon: RegionXIcon,
      label: 'RegionX Chain',
      value: 'RegionXChain',
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
        onChange={(e) => setChain(e.target.value)}
      >
        {menuItems.map(({ icon, label, value }, index) => (
          <MenuItem value={value} key={index}>
            <Box sx={{ display: 'flex', gap: '0.5rem' }}>
              <Image
                src={icon}
                alt='icon'
                style={{ width: '2rem', height: '2rem', borderRadius: "100%" }}
              />
              <Typography sx={{ lineHeight: 1.5, fontSize: '1.25rem' }}>
                {label}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
