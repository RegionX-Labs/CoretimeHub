import { MenuItem, Select } from '@mui/material';

import { FinalityType } from '@/models';

interface FinalitySelectorProps {
  finality: FinalityType;
  setFinality: (_: FinalityType) => void;
}

export const FinalitySelector = ({
  finality,
  setFinality,
}: FinalitySelectorProps) => {
  return (
    <Select
      value={finality}
      onChange={(e) => setFinality(e.target.value as FinalityType)}
      fullWidth
    >
      {Object.values(FinalityType).map((value, index) => (
        <MenuItem key={index} value={value}>
          {value}
        </MenuItem>
      ))}
    </Select>
  );
};
