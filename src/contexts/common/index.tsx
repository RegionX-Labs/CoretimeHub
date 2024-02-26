import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCoretimeApi, useRelayApi } from '../apis';
import { ApiState } from '../apis/types';
import { parseHNString } from '@/utils/functions';

interface CommonData {
  loading: boolean;
  timeslicePeriod: number;
  relayBlockNumber: number;
}

const defaultCommonData: CommonData = {
  loading: true,
  timeslicePeriod: 80,
  relayBlockNumber: 0,
};

const CommonDataContext = createContext<CommonData>(defaultCommonData);

interface Props {
  children: React.ReactNode;
}

const CommonDataProvider = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    const timeslicePeriod = parseHNString(
      coretimeApi.consts.broker.timeslicePeriod.toString()
    );
    const currentBlockHeight = parseHNString(
      (await relayApi.query.system.number()).toString()
    );

    setTimeslicePeriod(timeslicePeriod);
    setRelayBlockNumber(currentBlockHeight);
    setLoading(false);
  };

  useEffect(() => {
    collectCommonData();
  }, [relayConnected, coretimeConnected]);

  return (
    <CommonDataContext.Provider
      value={{ loading, relayBlockNumber, timeslicePeriod }}
    >
      {children}
    </CommonDataContext.Provider>
  );
};

const useCommon = () => useContext(CommonDataContext);

export { CommonDataProvider, useCommon };
