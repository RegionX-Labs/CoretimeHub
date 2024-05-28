import React, { useContext, useEffect, useReducer, useState } from 'react';

import { useNetwork } from '@/contexts/network';
import { useToast } from '@/contexts/toast';
import { NetworkType } from '@/models';

import { connect, disconnect, initialState, reducer } from '../common';
import { WS_KUSAMA_CORETIME_CHAIN, WS_ROCOCO_CORETIME_CHAIN } from '../consts';
import { ApiState } from '../types';

const types = {
  CoreIndex: 'u32',
  CoreMask: 'Vec<u8>',
  Timeslice: 'u32',
  RegionId: {
    begin: 'Timeslice',
    core: 'CoreIndex',
    mask: 'CoreMask',
  },
  RegionRecord: {
    end: 'Timeslice',
    owner: 'AccountId',
    paid: 'Option<Balance>',
  },
};

const defaultValue = {
  state: { ...initialState },
  disconnectCoretime: (): void => {
    /** */
  },
  timeslicePeriod: 80,
};

const CoretimeApiContext = React.createContext(defaultValue);

const CoretimeApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toastError } = useToast();

  const { network } = useNetwork();

  const [timeslicePeriod, setTimeslicePeriod] = useState(80);

  const getUrl = (network: any): string => {
    return network === NetworkType.ROCOCO
      ? WS_ROCOCO_CORETIME_CHAIN
      : WS_KUSAMA_CORETIME_CHAIN;
  };

  const disconnectCoretime = () => disconnect(state);

  useEffect(() => {
    state.apiError && toastError(`Failed to connect to Coretime chain`);
  }, [state.apiError, toastError]);

  useEffect(() => {
    if (network === NetworkType.NONE || state.socket == getUrl(network)) return;
    const updateNetwork = state.socket != getUrl(network);
    if (updateNetwork) {
      disconnect(state);
      connect(state, getUrl(network), dispatch, updateNetwork, types);
    }
  }, [network, state]);

  useEffect(() => {
    const { api, apiState } = state;

    if (!api || apiState !== ApiState.READY) return;

    const timeslicePeriod =
      api.consts.broker.timeslicePeriod.toJSON() as number;

    setTimeslicePeriod(timeslicePeriod);
  }, [state]);

  return (
    <CoretimeApiContext.Provider
      value={{ state, disconnectCoretime, timeslicePeriod }}
    >
      {props.children}
    </CoretimeApiContext.Provider>
  );
};

const useCoretimeApi = () => useContext(CoretimeApiContext);

export { CoretimeApiContextProvider, useCoretimeApi };
