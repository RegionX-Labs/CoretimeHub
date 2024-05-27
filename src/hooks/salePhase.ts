import { ApiPromise } from '@polkadot/api';
import { useCallback, useEffect, useState } from 'react';

import { getBlockTime, getBlockTimestamp } from '@/utils/functions';
import {
  getCurrentPhase,
  getSaleEndInBlocks,
  getSaleStartInBlocks,
} from '@/utils/sale';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { useSaleInfo } from '@/contexts/sales';
import { BrokerStatus, SalePhase } from '@/models';

type Endpoint = {
  start: number;
  end: number;
};

export type PhaseEndpoints = {
  interlude: Endpoint;
  leadin: Endpoint;
  fixed: Endpoint;
};

// Custom hook for fetching current phase
const useSalePhase = () => {
  const {
    state: { api, apiState },
  } = useCoretimeApi();
  const { network } = useNetwork();

  const { saleInfo, config } = useSaleInfo();

  const [currentPhase, setCurrentPhase] = useState<SalePhase | null>(null);
  const [loading, setLoading] = useState(false);

  const [saleStart, setSaleStart] = useState(0);
  const [saleEnd, setSaleEnd] = useState(0);
  const [saleEndTimestamp, setSaleEndTimestamp] = useState(0);
  const [saleStartTimestamp, setSaleStartTimestamp] = useState(0);

  const [endpoints, SetEndpoints] = useState<PhaseEndpoints | null>(null);

  const fetchCurrentPhase = useCallback(
    async (api: ApiPromise) => {
      const blockNumber = (await api.query.system.number()).toJSON() as number;
      const { lastCommittedTimeslice } = (
        await api.query.broker.status()
      ).toJSON() as BrokerStatus;

      const _saleStart = getSaleStartInBlocks(saleInfo);
      const _saleEnd = getSaleEndInBlocks(
        saleInfo,
        blockNumber,
        lastCommittedTimeslice,
        network
      );

      setSaleStart(_saleStart);
      setSaleEnd(_saleEnd);

      const _saleStartTimestamp = await getBlockTimestamp(
        api,
        _saleStart,
        network
      );
      const _saleEndTimestamp = await getBlockTimestamp(api, _saleEnd, network);

      setSaleStartTimestamp(_saleStartTimestamp);
      setSaleEndTimestamp(_saleEndTimestamp);

      setCurrentPhase(getCurrentPhase(saleInfo, blockNumber));

      const _endpoints = {
        interlude: {
          start:
            _saleStartTimestamp -
            config.interludeLength * getBlockTime(network),
          end: _saleStartTimestamp,
        },
        leadin: {
          start: _saleStartTimestamp,
          end:
            _saleStartTimestamp + config.leadinLength * getBlockTime(network),
        },
        fixed: {
          start:
            _saleStartTimestamp + config.leadinLength * getBlockTime(network),
          end: _saleEndTimestamp,
        },
      };
      SetEndpoints(_endpoints);
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
    saleStart,
    saleEnd,
    currentPhase,
    saleStartTimestamp,
    saleEndTimestamp,
    loading,
    endpoints,
  };
};

export default useSalePhase;
