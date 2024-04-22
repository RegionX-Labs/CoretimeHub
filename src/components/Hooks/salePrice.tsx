import { useCallback, useEffect, useState } from 'react';

import { getCurrentPrice } from '@/utils/sale/utils';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useSaleInfo } from '@/contexts/sales';

const useSalePrice = () => {
  const {
    state: { api, apiState },
  } = useCoretimeApi();
  const { saleInfo } = useSaleInfo();

  const [currentPrice, setCurrentPrice] = useState(0);

  const fetchCurrentPrice = useCallback(async () => {
    if (api && apiState == ApiState.READY) {
      const blockNumber = (await api.query.system.number()).toJSON() as number;
      const price = getCurrentPrice(saleInfo, blockNumber);
      setCurrentPrice(price);
    }
  }, [api, apiState, saleInfo]);

  useEffect(() => {
    fetchCurrentPrice();
  }, [fetchCurrentPrice]);

  return currentPrice;
};

export default useSalePrice;
