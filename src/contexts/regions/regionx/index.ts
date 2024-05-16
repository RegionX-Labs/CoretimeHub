import { ApiPromise } from '@polkadot/api';
import { Region } from 'coretime-utils';

import { parseHNString } from '@/utils/functions';
import { ISMPRecordStatus } from '@/models';

export const fetchRegions = async (
  regionxApi: ApiPromise | null
): Promise<Array<[Region, ISMPRecordStatus]>> => {
  if (!regionxApi) {
    return [];
  }
  try {
    const regionEntries = await regionxApi.query.regions.regions.entries();

    const regions: Array<[Region, ISMPRecordStatus]> = regionEntries
      .map(([key, value]) => {
        const keyTuple: any = key.toHuman(undefined, true);
        const { begin, core, mask } = keyTuple[0] as any;
        const { owner, record } = value.toJSON() as any;

        const regionId = {
          begin: parseHNString(begin.toString()),
          core: parseHNString(core.toString()),
          mask: mask,
        };
        const region = record.available
          ? new Region(regionId, {
              ...record.available,
              owner,
            })
          : new Region(
              regionId,
              /*dummy data*/ {
                end: 0,
                owner,
                paid: null,
              }
            );

        return [region, ISMPRecordStatus.AVAILABLE];
      })
      .filter((entry) => !!entry) as Array<[Region, ISMPRecordStatus]>;
    return regions;
  } catch (_) {
    return [];
  }
};
