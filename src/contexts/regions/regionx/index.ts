import { ApiPromise } from '@polkadot/api';
import { Region, RegionId } from 'coretime-utils';

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

export const fetchRegion = async (
  regionxApi: ApiPromise | null,
  regionId: RegionId
): Promise<Region | null> => {
  if (!regionxApi) return null;

  const record: any = (
    await regionxApi.query.regions.regions(regionId)
  ).toHuman();

  if (record) {
    const { end, owner, paid } = record;

    return new Region(regionId, {
      end: parseHNString(end),
      owner,
      paid: paid ? parseHNString(paid) : null,
    });
  } else {
    return null;
  }
};
