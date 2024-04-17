import { useNetwork } from '@/contexts/network';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const RelaySelect = () => {
  const { network, setNetwork } = useNetwork();
  const handleChange = (e: any) => {
    setNetwork(e.target.value);
  };

  return (
    <FormControl sx={{ m: 2, minWidth: 200 }} fullWidth>
      <InputLabel id='demo-simple-select-label'>Network</InputLabel>
      <Select
        id='network-select'
        value={network}
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
