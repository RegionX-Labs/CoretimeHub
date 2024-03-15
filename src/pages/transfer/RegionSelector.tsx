import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { RegionMetadata } from '@/models';

interface RegionSelectorProps {
  regions: Array<RegionMetadata>;
  selectedRegion: RegionMetadata | null;
  handleRegionChange: (_indx: number) => void;
}

export const RegionSelector = ({
  regions,
  selectedRegion,
  handleRegionChange,
}: RegionSelectorProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel id='destination-selector-label'>Region Name</InputLabel>
      <Select
        labelId='destination-selector-label'
        id='destination-selector'
        value={selectedRegion?.name}
        label='Destination'
        onChange={(e) => handleRegionChange(Number(e.target.value))}
      >
        {regions.map((region, indx) => (
          <MenuItem key={indx} value={indx}>
            {region.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const page = () => {
  return <></>;
};

export default page;
