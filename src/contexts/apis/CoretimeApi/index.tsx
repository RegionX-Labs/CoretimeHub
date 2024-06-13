import React, { useContext, useEffect, useReducer } from 'react';

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

  const TIMESLICE_PERIOD = 80;

  const getUrl = (network: any): string | null => {
    if (network === NetworkType.ROCOCO) {
      return WS_ROCOCO_CORETIME_CHAIN;
    } else if (network === NetworkType.KUSAMA) {
      return WS_KUSAMA_CORETIME_CHAIN;
    } else {
      return null;
    }
  };

  const disconnectCoretime = () => disconnect(state);

  useEffect(() => {
    state.apiState === ApiState.ERROR &&
      toastError(`Failed to connect to Coretime chain`);
  }, [state.apiState, toastError]);

  useEffect(() => {
    const url = getUrl(network);
    if (state.socket === url) return;
    if (!url) return;
    if (state.socket !== url) {
      try {
        disconnect(state);
      } catch {
        /** empty error handler */
      }
      connect(state, url, dispatch, true, types);
    }
  }, [network, state]);

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
