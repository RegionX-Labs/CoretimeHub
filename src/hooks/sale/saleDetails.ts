import { useEffect, useState } from 'react';

import { fetchSaleDetailsData } from '@/apis';
import { ApiResponse, NetworkType, PurchaseHistoryItem } from '@/models';

export const useSaleDetails = (network: NetworkType, saleCycle: number) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PurchaseHistoryItem[]>([]);
  const [isError, setError] = useState(false);

  useEffect(() => {
    const asyncFetchData = async () => {
      setData([]);
      setError(false);
      setLoading(false);

      try {
        setLoading(true);
        let finished = false;
        let after: string | null = null;

        const result = [];
        while (!finished) {
          const res: ApiResponse = await fetchSaleDetailsData(
            network,
            saleCycle,
            after
          );

          const { status, data } = res;
          if (status !== 200) break;

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
                  timestamp: new Date(`${timestamp}Z`),
                  price: parseInt(price),
                  type: purchaseType,
                }) as PurchaseHistoryItem
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
  }, [network, saleCycle]);

  return {
    loading,
    data,
    isError,
  };
};
