import React, { useContext, useEffect, useReducer } from 'react';

import {
  WS_KUSAMA_CORETIME_CHAIN,
  WS_PASEO_CORETIME_CHAIN,
  WS_POLKADOT_CORETIME_CHAIN,
  WS_ROCOCO_CORETIME_CHAIN,
  WS_WESTEND_CORETIME_CHAIN,
} from '@/consts';
import { useNetwork } from '@/contexts/network';
import { useToast } from '@/contexts/toast';
import { NetworkType } from '@/models';

import { connect, disconnect, initialState, reducer } from '../common';
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

  const TIMESLICE_PERIOD = 80;

  const getUrl = (network: any): string | null => {
    switch (network) {
      case NetworkType.POLKADOT:
        return WS_POLKADOT_CORETIME_CHAIN;
      case NetworkType.KUSAMA:
        return WS_KUSAMA_CORETIME_CHAIN;
      case NetworkType.PASEO:
        return WS_PASEO_CORETIME_CHAIN;
      case NetworkType.ROCOCO:
        return WS_ROCOCO_CORETIME_CHAIN;
      case NetworkType.WESTEND:
        return WS_WESTEND_CORETIME_CHAIN;
      default:
        return null;
    }
  };

  const disconnectCoretime = () => disconnect(state);

  useEffect(() => {
    state.apiState === ApiState.ERROR && toastError(`Failed to connect to Coretime chain`);
  }, [state.apiState, toastError]);

  useEffect(() => {
    const url = getUrl(network);
    if (!url || state.socket === url) return;
    if (state.socket !== url) disconnect(state);

    try {
      connect(state, url, dispatch, true, types);
    } catch (_err) {
      /** empty error handler */
    }
  }, [network]);

  return (
    <CoretimeApiContext.Provider
      value={{ state, disconnectCoretime, timeslicePeriod: TIMESLICE_PERIOD }}
    >
      {props.children}
    </CoretimeApiContext.Provider>
  );
};

const useCoretimeApi = () => useContext(CoretimeApiContext);

export { CoretimeApiContextProvider, useCoretimeApi };
