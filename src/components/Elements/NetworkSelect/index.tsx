import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useRouter } from 'next/router';

const RelaySelect = () => {
  const router = useRouter();
  const { network } = router.query;

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

  return (
    <FormControl sx={{ m: 2, minWidth: 200 }} fullWidth>
      <InputLabel>Network</InputLabel>
      <Select
        id='network-select'
        value={network ? network : 'rococo'}
        label='Relay chain'
        onChange={handleChange}
      >
        <MenuItem value='rococo'>Rococo</MenuItem>
        <MenuItem value='kusama'>Kusama</MenuItem>
      </Select>
    </FormControl>
  );
};

export default RelaySelect;
