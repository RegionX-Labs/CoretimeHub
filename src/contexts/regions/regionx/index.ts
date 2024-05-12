import { ApiPromise } from '@polkadot/api';
import { Region } from 'coretime-utils';

import { parseHNString } from '@/utils/functions';

export const fetchRegions = async (
  regionxApi: ApiPromise | null
): Promise<Array<Region>> => {
  if (!regionxApi) {
    return [];
  }
  try {
    const regionEntries = await regionxApi.query.regions.regions.entries();

    const regions: Array<Region> = regionEntries
      .map(([key, value]) => {
        const keyTuple: any = key.toHuman(undefined, true);
        const { begin, core, mask } = keyTuple[0] as any;
        const { owner, record: _record } = value.toHuman() as any;

        const regionId = {
          begin: parseHNString(begin.toString()),
          core: parseHNString(core.toString()),
          mask: mask,
        };
        return new Region(
          regionId,
          /*dummy data*/ {
            end: 0,
            owner,
            paid: null,
          }
        );
      })
      .filter((entry) => !!entry) as Array<Region>;
    return regions;
  } catch (_) {
    return [];
  }
};
