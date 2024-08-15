import { useEffect, useState } from 'react';

import { fetchProcessedOrders } from '@/apis';
import { ApiResponse, OrderItem } from '@/models';

export const useProcessedOrders = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OrderItem[]>([]);
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
          const res: ApiResponse = await fetchProcessedOrders(after);

          const { status, data } = res;
          if (status !== 200) break;

          if (data.processedOrders.nodes !== null)
            result.push(...data.processedOrders.nodes);

          finished = !data.processedOrders.pageInfo.hasNextPage;
          after = data.processedOrders.pageInfo.endCursor;
        }
        if (!finished) {
          setError(true);
        } else {
          setData(
            result.map(
              ({
                orderId,
                height,
                extrinsicId,
                timestamp,
                begin,
                core,
                mask,
                seller,
                reward,
              }) =>
                ({
                  orderId,
                  height,
                  extrinsicId,
                  timestamp: new Date(Number(timestamp)),
                  begin,
                  core,
                  mask,
                  account: seller,
                  reward,
                } as OrderItem)
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
  }, []);

  return {
    loading,
    data,
    isError,
  };
};
