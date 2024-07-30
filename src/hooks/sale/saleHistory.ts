import { useEffect, useState } from 'react';

import { SUBSCAN_CORETIME_INDEXER } from '@/consts';
import {
  NetworkType,
  SaleHistoryItem,
  SaleHistoryResponse,
  SaleHistoryResponseItem,
} from '@/models';

import { fetchGraphql } from '../../utils/fetchGraphql';

export const useSaleHistory = (network: NetworkType) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SaleHistoryItem[]>([]);
  const [isError, setError] = useState(false);

  useEffect(() => {
    const asyncFetchData = async () => {
      setLoading(true);
      setData([]);
      setError(false);

      try {
        const res = await fetchGraphql(
          `${SUBSCAN_CORETIME_INDEXER[network]}`,
          `{
            sales {
              nodes {
                regionBegin
                regionEnd
              }
              totalCount
            }
          }`
        );
        if (res.status !== 200) {
          setError(true);
        } else {
          const { data } = await res.json();

          const { nodes } = data.sales as SaleHistoryResponse;
          setData(
            nodes.map((x: SaleHistoryResponseItem) => x as SaleHistoryItem)
          );
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    };

    asyncFetchData();
  }, [network]);

  return { loading, data, isError };
};
