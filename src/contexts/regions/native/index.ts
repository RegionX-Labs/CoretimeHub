import { ApiPromise } from '@polkadot/api';
import { Region, RegionId } from 'coretime-utils';

import { parseHNString } from '@/utils/functions';

export const fetchRegions = async (
  coretimeApi: ApiPromise | null
): Promise<Array<Region>> => {
  if (!coretimeApi) {
    return [];
  }
  try {
    const brokerEntries = await coretimeApi.query.broker.regions.entries();

    const brokerRegions: Array<Region> = brokerEntries
      .map(([key, value]) => {
        const keyTuple: any = key.toHuman(undefined, true);
        const { begin, core, mask } = keyTuple[0] as any;
        const { end, owner, paid } = value.toHuman() as any;

        const regionId = {
          begin: parseHNString(begin.toString()),
          core: parseHNString(core.toString()),
          mask: mask,
        };
        return new Region(
          regionId,
          {
            end: parseHNString(end),
            owner,
            paid: paid ? parseHNString(paid) : null,
          },
        );
      })
      .filter((entry) => !!entry) as Array<Region>;
    return brokerRegions;
  } catch (_) {
    return [];
  }
};

export const fetchRegion = async (
  coretimeApi: ApiPromise | null,
  regionId: RegionId
): Promise<Region | null> => {
  if (!coretimeApi) return null;

  const record: any = (
    await coretimeApi.query.broker.regions(regionId)
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
    );
  } else {
    return null;
  }
};
