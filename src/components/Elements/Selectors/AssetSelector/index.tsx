import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

import { Asset } from '@/models';

interface AssetSelectorProps {
  asset: Asset;
  setAsset: (_: Asset) => void;
  symbol: string;
}

export default function AssetSelector({ asset, setAsset, symbol }: AssetSelectorProps) {
  return (
    <FormControl>
      <FormLabel>Asset</FormLabel>
      <RadioGroup
        row
        value={asset}
        onChange={(e) => setAsset(e.target.value as Asset)}
      >
        <FormControlLabel value='token' control={<Radio />} label={`${symbol} token`} />
        <FormControlLabel value='region' control={<Radio />} label='Region' />
      </RadioGroup>
    </FormControl>
  );
}
