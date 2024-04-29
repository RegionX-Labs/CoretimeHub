import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';

import KusamaIcon from '@/assets/networks/relay/kusama.png';
import RococoIcon from '@/assets/networks/relay/rococo.png';
import { useNetwork } from '@/contexts/network';
import { NetworkType } from '@/models';

const RelaySelect = () => {
  const router = useRouter();
  const { network } = useNetwork();

  const handleChange = (e: any) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, network: e.target.value },
      },
      undefined,
      { shallow: false }
    );
  };

  const theme = useTheme();

  const menuItems = [
    {
      value: NetworkType.ROCOCO,
      label: 'Rococo',
      icon: RococoIcon,
    },
    {
      value: NetworkType.KUSAMA,
      label: 'Kusama',
      icon: KusamaIcon,
    },
  ];

  return network !== NetworkType.NONE ? (
    <FormControl size='small'>
      <InputLabel sx={{ color: theme.palette.grey[800] }}>Network</InputLabel>
      <Select
        id='network-select'
        value={network}
        label='Relay chain'
        onChange={handleChange}
      >
        {menuItems.map(({ value, label, icon }, index) => (
          <MenuItem value={value} key={index}>
            <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Image
                src={icon}
                alt={label.toLowerCase()}
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '100%',
                }}
              />
              <Typography sx={{ lineHeight: 1.5, fontSize: '1rem' }}>
                {label}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : (
    <></>
  );
};

export default RelaySelect;
