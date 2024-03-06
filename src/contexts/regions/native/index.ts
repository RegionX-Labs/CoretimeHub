import { ApiPromise } from '@polkadot/api';
import { CoreMask, Region, RegionId } from 'coretime-utils';

import { parseHNString } from '@/utils/functions';

export const fetchRegions = async (
  coretimeApi: ApiPromise | null
): Promise<Array<Region>> => {
  if (!coretimeApi) {
    return [];
  }
  const brokerEntries = await coretimeApi.query.broker.regions.entries();

  const brokerRegions: Array<Region> = brokerEntries
    .map(([key, value]) => {
      const keyTuple: any = key.toHuman();
      const { begin, core, mask } = keyTuple[0] as any;
      const { end, owner, paid } = value.toHuman() as any;

      const regionId = {
        begin: parseHNString(begin.toString()),
        core: parseHNString(core.toString()),
        mask: new CoreMask(mask),
      };
      return new Region(
        regionId,
        {
          end: parseHNString(end),
          owner,
          paid: paid ? parseHNString(paid) : null,
        },
        0
      );
    })
    .filter((entry) => entry !== null) as Array<Region>;

  return brokerRegions;
};

export const fetchRegion = async (
  coretimeApi: ApiPromise | null,
  regionId: RegionId
): Promise<Region | null> => {
  if (!coretimeApi) return null;

  const record: any = (
    await coretimeApi.query.broker.regions({
      begin: regionId.begin,
      core: regionId.core,
      mask: regionId.mask.getMask(),
    })
  ).toHuman();

  if (record) {
    const { end, owner, paid } = record;

    return new Region(
      regionId,
      {
        end: parseHNString(end),
        owner,
        paid: paid ? parseHNString(paid) : null,
      },
      0
    );
  } else {
    return null;
  }
};
