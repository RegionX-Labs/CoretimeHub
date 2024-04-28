import { useCallback, useEffect, useState } from 'react';

import { getCurrentPrice } from '@/utils/sale/utils';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useSaleInfo } from '@/contexts/sales';
import { useRouter } from 'next/router';

interface SalePriceProps {
  at: number;
}

const useSalePrice = ({ at }: SalePriceProps) => {
  const {
    state: { api, apiState },
  } = useCoretimeApi();
  const { saleInfo } = useSaleInfo();

  const [currentPrice, setCurrentPrice] = useState(0);
  const router = useRouter();
  const { network } = router.query;

  const fetchCurrentPrice = useCallback(async () => {
    if (api && apiState === ApiState.READY) {
      const price = getCurrentPrice(saleInfo, at, network);
      setCurrentPrice(price);
    }
  }, [api, apiState, saleInfo]);

  useEffect(() => {
    fetchCurrentPrice();
  }, [fetchCurrentPrice]);

  return currentPrice;
};

export default useSalePrice;
