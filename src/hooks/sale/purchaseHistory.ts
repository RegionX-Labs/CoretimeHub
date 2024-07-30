import { useEffect, useState } from 'react';

import { fetchPurchaseHistoryData } from '@/apis';
import { NetworkType, PurchaseHistoryItem } from '@/models';

export const usePurchaseHistory = (
  network: NetworkType,
  regionBegin: number
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
        let finished = false;
        let after: string | null = null;

        const result = [];
        while (!finished) {
          const res = await fetchPurchaseHistoryData(
            network,
            regionBegin,
            after
          );

          if (res.status !== 200) break;

          const { data } = await res.json();

          if (data.purchases.nodes !== null)
            result.push(...data.purchases.nodes);

          finished = !data.purchases.pageInfo.hasNextPage;
          after = data.purchases.pageInfo.endCursor;
        }
        if (!finished) {
          setError(true);
        } else {
          setData(
            result.map(
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
                  extrinsicId: `${height}-${extrinsicId}`,
                  timestamp,
                  price: parseInt(price),
                  type: purchaseType,
                } as PurchaseHistoryItem)
            )
          );
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    asyncFetchData();
  }, [network, regionBegin]);

  return {
    loading,
    data,
    isError,
  };
};
