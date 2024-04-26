import { ApiPromise } from '@polkadot/api';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import {
  getBlockTime,
  getBlockTimestamp,
  parseHNString,
} from '@/utils/functions';
import {
  getCurrentPhase,
  getSaleEndInBlocks,
  getSaleStartInBlocks,
} from '@/utils/sale/utils';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useSaleInfo } from '@/contexts/sales';
import { SalePhase } from '@/models';


export type PhaseEndingPoints = {
  interlude: number;
  leadin: number;
  fixed: number;
};

// Custom hook for fetching current phase
const useSalePhase = () => {
  const {
    state: { api, apiState },
  } = useCoretimeApi();
  const { saleInfo, config } = useSaleInfo();

  const [currentPhase, setCurrentPhase] = useState<SalePhase | null>(null);
  const [loading, setLoading] = useState(false);

  const [saleEndTimestamp, setSaleEndTimestamp] = useState(0);
  const [saleStartTimestamp, setSaleStartTimestamp] = useState(0);

  const [endingPoints, setEndingPoints] = useState<PhaseEndingPoints>({
    interlude: 0, leadin: 0, fixed: 0
  });

  const router = useRouter();
  const { network } = router.query;

  const fetchCurrentPhase = useCallback(
    async (api: ApiPromise) => {
      const blockNumber = (await api.query.system.number()).toJSON() as number;
      const lastCommittedTimeslice = parseHNString(
        (
          (await api.query.broker.status()).toHuman() as any
        ).lastCommittedTimeslice.toString()
      );

      const _saleStart = getSaleStartInBlocks(saleInfo);
      const _saleEnd = getSaleEndInBlocks(
        saleInfo,
        blockNumber,
        lastCommittedTimeslice,
        network
      );

      const _saleStartTimestamp = await getBlockTimestamp(api, _saleStart, getBlockTime(network));
      setSaleStartTimestamp(_saleStartTimestamp);
      const _saleEndTimestamp = await getBlockTimestamp(api, _saleEnd, getBlockTime(network));
      setSaleEndTimestamp(_saleEndTimestamp);

      setCurrentPhase(getCurrentPhase(saleInfo, blockNumber));

      const _endingPoints = {
        interlude: _saleStartTimestamp,
        leadin: _saleStartTimestamp + (config.interludeLength * getBlockTime(network)),
        fixed: _saleEndTimestamp
      }

      console.log(_endingPoints);
      setEndingPoints(_endingPoints);
    },
    [saleInfo, config, network]
  );

  useEffect(() => {
    if (!api || apiState !== ApiState.READY) return;

    const asyncFetchCurrentPhase = async () => {
      setLoading(true);
      await fetchCurrentPhase(api);
      setLoading(false);
    };
    asyncFetchCurrentPhase();
  }, [fetchCurrentPhase, api, apiState]);

  return {
    currentPhase,
    saleStartTimestamp,
    saleEndTimestamp,
    loading,
    endingPoints
  };
};

export default useSalePhase;
