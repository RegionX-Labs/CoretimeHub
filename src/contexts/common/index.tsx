import { ContextData } from 'coretime-utils';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { useCoretimeApi, useRelayApi } from '../apis';
import { ApiState } from '../apis/types';

const defaultContextData: ContextData = {
  timeslicePeriod: 80,
  relayBlockNumber: 0,
};

const ContextDataContext = createContext<ContextData>(defaultContextData);

interface Props {
  children: React.ReactNode;
}

const ContextDataProvider = ({ children }: Props) => {
  const [timeslicePeriod, setTimeslicePeriod] = useState(80);
  const [relayBlockNumber, setRelayBlockNumber] = useState(0);

  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();

  const relayConnected = relayApi && relayApiState === ApiState.READY;
  const coretimeConnected = coretimeApi && coretimeApiState === ApiState.READY;

  useEffect(() => {
    const collectContextData = async () => {
      if (!relayConnected || !relayApi.query.system) return;
      const currentBlockHeight = parseHNString(
        (await relayApi.query.system.number()).toString()
      );
      setRelayBlockNumber(currentBlockHeight);

      if (!coretimeConnected || !coretimeApi.consts.broker) return;

      const timeslicePeriod = parseHNString(
        coretimeApi.consts.broker.timeslicePeriod.toString()
      );

      setTimeslicePeriod(timeslicePeriod);
    };

    collectContextData();
  }, [relayConnected, coretimeConnected, relayApi, coretimeApi]);

  return (
    <ContextDataContext.Provider value={{ relayBlockNumber, timeslicePeriod }}>
      {children}
    </ContextDataContext.Provider>
  );
};

const useCommon = () => useContext(ContextDataContext);

export { ContextDataProvider, useCommon };
