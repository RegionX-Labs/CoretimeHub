import React, { useContext, useEffect, useReducer, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { useToast } from '@/contexts/toast';
import { NetworkType, ParaId } from '@/models';

import { connect, disconnect, initialState, reducer } from '../common';
import { WS_KUSAMA_RELAY_CHAIN, WS_ROCOCO_RELAY_CHAIN } from '../consts';

const defaultValue = {
  state: initialState,
  disconnectRelay: (): void => {
    /** */
  },
  paraIds: [] as number[],
};

const RelayApiContext = React.createContext(defaultValue);

const RelayApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toastError } = useToast();
  const [paraIds, setParaIds] = useState<ParaId[]>([]);

  const { network } = useNetwork();

  useEffect(() => {
    state.apiError && toastError(`Failed to connect to relay chain`);
  }, [state.apiError, toastError]);

  const disconnectRelay = () => disconnect(state);

  const getUrl = (network: any): string => {
    return network === NetworkType.ROCOCO
      ? WS_ROCOCO_RELAY_CHAIN
      : WS_KUSAMA_RELAY_CHAIN;
  };

  useEffect(() => {
    if (network === NetworkType.NONE || state.socket == getUrl(network)) return;
    const updateNetwork = state.socket != getUrl(network);
    if (updateNetwork) {
      disconnectRelay();
      connect(state, getUrl(network), dispatch, updateNetwork);
    }
  }, [network, state]);

  useEffect(() => {
    const { api, apiState } = state;
    if (!api || apiState !== ApiState.READY) return;
    const fetchParaIds = async () => {
      if (!api.query.paras) return;
      const paras = await api.query.registrar.paras.keys();
      const paraIds = paras.map((key: any) =>
        parseHNString(key.toHuman().toString())
      );
      setParaIds(paraIds);
    };
    fetchParaIds();
  }, [state]);

  return (
    <RelayApiContext.Provider value={{ state, disconnectRelay, paraIds }}>
      {props.children}
    </RelayApiContext.Provider>
  );
};

const useRelayApi = () => useContext(RelayApiContext);

export { RelayApiContextProvider, useRelayApi };
