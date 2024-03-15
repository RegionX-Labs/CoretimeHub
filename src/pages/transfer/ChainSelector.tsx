import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface ChainSelectorProps {
  chain: string;
  setChain: (_: string) => void;
}

export const ChainSelector = ({ chain, setChain }: ChainSelectorProps) => {
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
        <MenuItem value='CoretimeChain'>Coretime Chain</MenuItem>
        <MenuItem value='ContractsChain'>Contracts Chain</MenuItem>
      </Select>
    </FormControl>
  );
};

const page = () => {
  return <></>;
};

export default page;
