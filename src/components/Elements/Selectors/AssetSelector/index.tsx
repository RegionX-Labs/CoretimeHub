import { useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

import { AssetType } from '@/models';

interface AssetSelectorProps {
  asset: AssetType;
  setAsset: (_: AssetType) => void;
  symbol: string;
  showRegion?: boolean;
}

export default function AssetSelector({
  asset,
  setAsset,
  symbol,
  showRegion = true,
}: AssetSelectorProps) {
  const theme = useTheme();
  return (
    <FormControl>
      <FormLabel sx={{ color: theme.palette.text.primary }}>Asset</FormLabel>
      <RadioGroup
        row
        value={asset}
        onChange={(e) => setAsset(parseInt(e.target.value) as AssetType)}
        sx={{ color: theme.palette.text.primary }}
      >
        <FormControlLabel
          value={AssetType.TOKEN}
          control={<Radio />}
          label={`${symbol} token`}
        />
        {showRegion && (
          <FormControlLabel
            value={AssetType.REGION}
            control={<Radio />}
            label='Region'
          />
        )}
      </RadioGroup>
    </FormControl>
  );
}
