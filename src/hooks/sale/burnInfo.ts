import { useEffect, useState } from 'react';

import { fetchPurchaseHistoryData } from '@/apis';
import { ApiResponse, NetworkType } from '@/models';

import { useSaleHistory } from './saleHistory';

export const useBurnInfo = (network: NetworkType) => {
  const [totalBurn, setTotalBurn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentBurn, setCurrentBurn] = useState(0);
  const [prevBurn, setPrevBurn] = useState(0);

  const saleHistory = useSaleHistory(network);

  useEffect(() => {
    const asyncFetchData = async () => {
      setLoading(false);
      setTotalBurn(0);
      setCurrentBurn(0);
      setPrevBurn(0);

      if (saleHistory.isError) return;
      if (saleHistory.loading) {
        setLoading(true);
        return;
      }

      const regionBegins = saleHistory.data
        .map((item) => item.regionBegin)
        .sort((a, b) => b - a);

      let total = 0;
      for (let idx = 0; idx < regionBegins.length; ++idx) {
        const regionBegin = regionBegins[idx];

        let finished = false;
        let after: string | null = null;

        const result = [];
        while (!finished) {
          const res: ApiResponse = await fetchPurchaseHistoryData(
            network,
            regionBegin,
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
          idx--;
          continue;
        }

        const burn = result
          ? result.reduce((acc, { price }) => acc + parseInt(price), 0)
          : 0;
        total += burn;

        if (idx === 0) setCurrentBurn(burn);
        else if (idx === 1) setPrevBurn(burn);
      }
      setTotalBurn(total);
      setLoading(false);
    };
    asyncFetchData();
  }, [network, saleHistory.loading, saleHistory.isError]);

  return { loading, totalBurn, currentBurn, prevBurn };
};
