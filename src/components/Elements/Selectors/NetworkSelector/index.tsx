import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
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

  return (
    <FormControl size='small'>
      <Select
        id='network-select'
        value={network}
        label='Relay chain'
        onChange={handleChange}
        sx={{
          border: 'none', // Remove border
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none', // Ensure no border is shown
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: 'none', // Ensure no border on hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'none', // Ensure no border when focused
          },
        }}
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
  );
};

export default RelaySelect;
