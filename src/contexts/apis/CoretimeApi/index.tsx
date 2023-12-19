import { ApiPromise, WsProvider } from '@polkadot/api';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import { DefinitionRpcExt } from '@polkadot/types/types';
import React, { useContext, useEffect, useReducer } from 'react';

import { ApiState } from '@/contexts/apis/types';
import { useToast } from '@/contexts/Toast';

import { WS_CORETIME_CHAIN } from '../consts';

///
// Initial state for `useReducer`

type State = {
  jsonrpc: Record<string, Record<string, DefinitionRpcExt>>;
  api: any;
  apiError: any;
  apiState: ApiState;
};

const initialState: State = {
  // These are the states
  jsonrpc: { ...jsonrpc },
  api: null,
  apiError: null,
  apiState: ApiState.DISCONNECTED,
};

///
// Reducer function for `useReducer`

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'CONNECT_INIT':
      return { ...state, apiState: ApiState.CONNECT_INIT };
    case 'CONNECT':
      return { ...state, api: action.payload, apiState: ApiState.CONNECTING };
    case 'CONNECT_SUCCESS':
      return { ...state, apiState: ApiState.READY };
    case 'CONNECT_ERROR':
      return { ...state, apiState: ApiState.ERROR, apiError: action.payload };
    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};

///
// Connecting to the Substrate node

const connect = (state: any, socket: string, dispatch: any) => {
  const { apiState, jsonrpc } = state;
  // We only want this function to be performed once
  if (apiState !== ApiState.DISCONNECTED) return;

  dispatch({ type: 'CONNECT_INIT' });

  const provider = new WsProvider(socket);
  const _api = new ApiPromise({ provider, rpc: jsonrpc });

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    dispatch({ type: 'CONNECT', payload: _api });
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    _api.isReady.then(() => dispatch({ type: 'CONNECT_SUCCESS' }));
  });
  _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS' }));
  _api.on('error', (err) => dispatch({ type: 'CONNECT_ERROR', payload: err }));
};

const defaultValue = {
  state: initialState,
};

const CoretimeApiContext = React.createContext(defaultValue);

const CoretimeApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toastError, toastSuccess } = useToast();

  useEffect(() => {
    state.apiError &&
      toastError(
        `Failed to connect to Coretime chain: error = ${state.apiError.toString()}`
      );
  }, [state.apiError]);

  useEffect(() => {
    state.apiState === ApiState.READY &&
      toastSuccess('Successfully connected to the Coretime chain');
  }, [state.apiState]);

  useEffect(() => {
    connect(state, WS_CORETIME_CHAIN, dispatch);
  }, []);

  return (
    <CoretimeApiContext.Provider value={{ state }}>
      {props.children}
    </CoretimeApiContext.Provider>
  );
};

const useCoretimeApi = () => useContext(CoretimeApiContext);

export { CoretimeApiContextProvider, useCoretimeApi };
