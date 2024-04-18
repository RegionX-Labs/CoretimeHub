import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Asset } from '@/models';

interface AssetSelectorProps {
  asset: Asset;
  setAsset: (_: Asset) => void;
}

export default function AssetSelector({ asset, setAsset }: AssetSelectorProps) {
  return (
    <FormControl>
      <FormLabel>Asset</FormLabel>
      <RadioGroup
        row
        value={asset}
        onChange={(e) => setAsset(e.target.value as Asset)}
      >
        <FormControlLabel value='token' control={<Radio />} label='ROC token' />
        <FormControlLabel value='region' control={<Radio />} label='Region' />
      </RadioGroup>
    </FormControl>
  );
}
