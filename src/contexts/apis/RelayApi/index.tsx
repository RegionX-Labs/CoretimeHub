import React, { useContext, useEffect, useReducer, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/toast';
import { ParaId } from '@/models';

import { connect, disconnect, initialState, reducer } from '../common';
import { WS_RELAY_CHAIN } from '../consts';

const defaultValue = {
  state: initialState,
  connectRelay: (): void => {
    /** */
  },
  disconnectRelay: (): void => {
    /** */
  },
  paraIds: [] as number[],
};

const RelayApiContext = React.createContext(defaultValue);

const RelayApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toastError, toastSuccess } = useToast();
  const [paraIds, setParaIds] = useState<ParaId[]>([]);

  useEffect(() => {
    state.apiError && toastError(`Failed to connect to relay chain`);
  }, [state.apiError, toastError]);

  useEffect(() => {
    state.apiState === ApiState.READY &&
      toastSuccess('Successfully connected to the relay chain');
  }, [state.apiState, toastSuccess]);

  const connectRelay = () => connect(state, WS_RELAY_CHAIN, dispatch);
  const disconnectRelay = () => disconnect(state);

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
    <RelayApiContext.Provider
      value={{ state, connectRelay, disconnectRelay, paraIds }}
    >
      {props.children}
    </RelayApiContext.Provider>
  );
};

const useRelayApi = () => useContext(RelayApiContext);

export { RelayApiContextProvider, useRelayApi };
