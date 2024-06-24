import { SUBSCAN_CORETIME_API } from '@/consts';
import { NetworkType } from '@/models';

export const fetchPurchaseHistoryData = async (
  network: NetworkType,
  regionBegin: number,
  page: number,
  row: number
) => {
  const res = await fetch(
    `${SUBSCAN_CORETIME_API[network]}/api/scan/broker/purchased`,
    {
      method: 'POST',
      body: JSON.stringify({
        region_begin: regionBegin,
        row,
        page,
      }),
    }
  );
  return res;
};
