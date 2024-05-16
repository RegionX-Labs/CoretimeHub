import { ApiPromise } from '@polkadot/api';
import { Region } from 'coretime-utils';

import { parseHNString } from '@/utils/functions';
import { ISMPRecordStatus } from '@/models';
import { makeResponse } from '@/utils/ismp';

export const fetchRegions = async (
  regionxApi: ApiPromise | null
): Promise<Array<[Region, ISMPRecordStatus, string?]>> => {
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

        if (record.available) {
          const region = new Region(regionId, {
            ...record.available,
            owner,
          });
          return [region, ISMPRecordStatus.AVAILABLE];
        } else {
          const region = new Region(
            regionId,
            /*dummy data*/ {
              end: 0,
              owner,
              paid: null,
            }
          );
          console.log(record.pending);
          return [
            region,
            record.pending
              ? ISMPRecordStatus.PENDING
              : ISMPRecordStatus.UNAVAILABLE,
            record.pending,
          ];
        }
      })
      .filter((entry) => !!entry) as Array<[Region, ISMPRecordStatus]>;
    return regions;
  } catch (_) {
    return [];
  }
};
