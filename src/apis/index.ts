import { SUBSCAN_CORETIME_API } from '@/consts';
import { Address, NetworkType } from '@/models';

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

export const fetchAccountExtrinsics = async (
  network: NetworkType,
  address: Address,
  page: number,
  row: number
) => {
  const res = await fetch(
    `${SUBSCAN_CORETIME_API[network]}/api/v2/scan/extrinsics`,
    {
      method: 'POST',
      body: JSON.stringify({
        address,
        row: 100,
        page,
      }),
    }
  );
  return res;
};
