import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useRouter } from 'next/router';

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

  return network !== NetworkType.NONE ? (
    <FormControl sx={{ m: 2, minWidth: 150 }} fullWidth>
      <InputLabel>Network</InputLabel>
      <Select
        id='network-select'
        value={network}
        label='Relay chain'
        onChange={handleChange}
      >
        <MenuItem value={NetworkType.ROCOCO}>Rococo</MenuItem>
        <MenuItem value={NetworkType.KUSAMA}>Kusama</MenuItem>
      </Select>
    </FormControl>
  ) : (
    <></>
  );
};

export default RelaySelect;
