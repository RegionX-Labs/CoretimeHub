import { useEffect, useState } from 'react';

import { fetchPurchaseHistoryData } from '@/apis';
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
      setData([]);
      setError(false);
      setLoading(false);

      if (regionBegin === 0) return;

      try {
        setLoading(true);
        const res = await fetchPurchaseHistoryData(
          network,
          regionBegin,
          page,
          row
        );
        if (res.status !== 200) {
          setError(true);
        } else {
          const { message, data } = await res.json();
          if (message !== 'Success') {
            setError(true);
          } else {
            const { list } = data as PurchaseHistoryResponse;

            setData(
              list.map(
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
                    price: parseInt(price),
                    type: purchased_type,
                  } as PurchaseHistoryItem)
              )
            );
          }
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    asyncFetchData();
  }, [network, regionBegin, page, row]);

  return {
    loading,
    data,
    isError,
  };
};
