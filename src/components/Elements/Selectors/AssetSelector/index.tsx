import { ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import FormControl from '@mui/material/FormControl';

import { AssetType } from '@/models';

import styles from './index.module.scss';

interface AssetSelectorProps {
  asset: AssetType;
  setAsset: (_: AssetType) => void;
  symbol: string;
}

export default function AssetSelector({
  asset,
  setAsset,
  symbol,
}: AssetSelectorProps) {
  const theme = useTheme();
  const items = [
    {
      value: AssetType.TOKEN,
      label: symbol,
    },
    {
      value: AssetType.REGION,
      label: 'Region',
    },
  ];

  return (
    <FormControl>
      <ToggleButtonGroup
        value={asset}
        exclusive // This ensures only one can be selected at a time
        onChange={(e: any) => setAsset(parseInt(e.target.value) as AssetType)}
        className={styles.options}
      >
        {items.map(({ label, value }, index) => (
          <ToggleButton
            className={styles.option}
            sx={{
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.grey['200']}`,
            }}
            value={value}
            key={index}
          >
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
}
