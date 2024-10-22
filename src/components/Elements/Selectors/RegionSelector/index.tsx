import { FormControl } from '@mui/material';
import { RegionMinimal, Select } from '@region-x/components';

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
      <Select
        options={regions.map((r) => {
          return {
            label: r.name || '',
            value: r.rawId,
          };
        })}
        onChange={(v) => handleRegionChange(regions.findIndex((r) => r.rawId === v))}
      />
      {selectedRegion && (
        <div style={{ marginTop: '1rem' }}>
          <RegionMinimal
            rawId={selectedRegion.rawId.toString()}
            name={selectedRegion.name || ''}
            regionStart={'Timeslice: ' + selectedRegion.region.getBegin().toString()}
            regionEnd={'Timeslice: ' + selectedRegion.region.getEnd().toString()}
          />
        </div>
      )}
    </FormControl>
  );
};
