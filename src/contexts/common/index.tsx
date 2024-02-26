import React, { createContext, useContext, useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { CommonData } from '@/models';

import { useCoretimeApi, useRelayApi } from '../apis';
import { ApiState } from '../apis/types';

const defaultCommonData: CommonData = {
  timeslicePeriod: 80,
  relayBlockNumber: 0,
};

const CommonDataContext = createContext<CommonData>(defaultCommonData);

interface Props {
  children: React.ReactNode;
}

const CommonDataProvider = ({ children }: Props) => {
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

  const collectCommonData = async () => {
    if (!relayApi || !coretimeApi) return;
    const timeslicePeriod = parseHNString(
      coretimeApi.consts.broker.timeslicePeriod.toString()
    );
    const currentBlockHeight = parseHNString(
      (await relayApi.query.system.number()).toString()
    );

    setTimeslicePeriod(timeslicePeriod);
    setRelayBlockNumber(currentBlockHeight);
  };

  useEffect(() => {
    collectCommonData();
  }, [relayConnected, coretimeConnected]);

  return (
    <CommonDataContext.Provider value={{ relayBlockNumber, timeslicePeriod }}>
      {children}
    </CommonDataContext.Provider>
  );
};

const useCommon = () => useContext(CommonDataContext);

export { CommonDataProvider, useCommon };
