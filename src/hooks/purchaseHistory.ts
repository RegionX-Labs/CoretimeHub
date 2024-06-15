import { useEffect, useState } from 'react';

import { SUBSCAN_CORETIME_API } from '@/consts';
import {
  NetworkType,
  PurchaseHistoryItem,
  PurchaseHistoryResponse,
} from '@/models';

export const usePurchaseHistory = (
  network: NetworkType,
  regionBegin: number,
  page: number,
  row: number
) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PurchaseHistoryItem[]>([]);
  const [isError, setError] = useState(false);

  useEffect(() => {
    const asyncFetchData = async () => {
      setLoading(true);
      try {
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
        if (res.status !== 200) {
          setError(true);
        } else {
          const jsonData = await res.json();
          if (jsonData.message !== 'Success') {
            setError(true);
            setData([]);
          } else {
            if (jsonData.data.count == 0) {
              setData([]);
              setLoading(false);
              return;
            }
            const data = jsonData.data as PurchaseHistoryResponse;
            setData(
              data.list.map(
                ({
                  account: { address },
                  core,
                  extrinsic_index,
                  block_timestamp,
                  price,
                  purchased_type,
                }) =>
                  ({
                    address,
                    core,
                    extrinsic_index,
                    timestamp: block_timestamp,
                    price,
                    type: purchased_type,
                  }) as PurchaseHistoryItem
              )
            );
          }
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    };
    asyncFetchData();
  }, [network, regionBegin, page, row]);

  return {
    loading,
    data,
    isError,
  };
};
