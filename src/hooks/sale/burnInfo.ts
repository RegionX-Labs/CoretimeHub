import { useEffect, useState } from 'react';

import { fetchBurnInfo } from '@/apis';
import { ApiResponse, NetworkType } from '@/models';

export const useBurnInfo = (network: NetworkType) => {
  const [totalBurn, setTotalBurn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentBurn, setCurrentBurn] = useState(0);
  const [prevBurn, setPrevBurn] = useState(0);

  useEffect(() => {
    const asyncFetchData = async () => {
      setLoading(true);

      const res: ApiResponse = await fetchBurnInfo(network);
      const { status, data } = res;
      if (status !== 200) return;

      setCurrentBurn(parseInt(data.sales.nodes[0]?.burn || '0'));
      setPrevBurn(parseInt(data.sales.nodes[1]?.burn || '0'));
      setTotalBurn(parseInt(data.stats.nodes[0].totalBurn));
      setLoading(false);
    };
    asyncFetchData();
  }, [network]);

  return { loading, totalBurn, currentBurn, prevBurn };
};
