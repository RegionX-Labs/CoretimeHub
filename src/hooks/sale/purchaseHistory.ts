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
          const { data } = await res.json();
          const { nodes } = data.purchases as PurchaseHistoryResponse;

          if (!nodes) setData([]);
          else {
            setData(
              nodes.map(
                ({
                  account,
                  core,
                  extrinsicId,
                  height,
                  price,
                  purchaseType,
                  timestamp,
                }) =>
                  ({
                    address: account,
                    core,
                    extrinsic_index: `${height}-${extrinsicId}`,
                    timestamp,
                    price: parseInt(price),
                    type: purchaseType,
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
