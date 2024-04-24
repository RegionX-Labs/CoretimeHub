import type { Signer } from '@polkadot/api/types';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

export enum KeyringState {
  // eslint-disable-next-line no-unused-vars
  DISCONNECTED = 'disconnected',
  // eslint-disable-next-line no-unused-vars
  LOADING = 'loading',
  // eslint-disable-next-line no-unused-vars
  READY = 'ready',
  // eslint-disable-next-line no-unused-vars
  ERROR = 'error',
}

type State = {
  status: KeyringState;
  accounts: InjectedAccountWithMeta[];
  activeAccount: InjectedAccountWithMeta | null;
  activeSigner: Signer | null;
};

const initialState: State = {
  status: KeyringState.DISCONNECTED,
  accounts: [],
  activeAccount: null,
  activeSigner: null,
};

interface Props {
  children: React.ReactNode;
}

const reducer = (state: State, action: any) => {
  switch (action.type) {
    case 'LOAD_KEYRING':
      return { ...state, keyringState: KeyringState.LOADING };
    case 'KEYRING_READY':
      return { ...state, KeyringState: KeyringState.READY };
    case 'KEYRING_ERROR':
      return { ...state, keyring: null, keyringState: KeyringState.ERROR };
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
    case 'SET_ACTIVE_ACCOUNT':
      return { ...state, activeAccount: action.payload };
    case 'SET_ACTIVE_SIGNER':
      return { ...state, activeSigner: action.payload } as State;
    case 'DISCONNECT':
      return {
        status: KeyringState.DISCONNECTED,
        accounts: [],
        activeAccount: null,
        activeSigner: null,
      } as State;
    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};

interface AccountData {
  state: State;
  setActiveAccount: (_acct: InjectedAccountWithMeta) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const defaultAccountData: AccountData = {
  state: initialState,
  setActiveAccount: (_acct: InjectedAccountWithMeta) => {
    /** */
  },
  connectWallet: () => {
    /** */
  },
  disconnectWallet: () => {
    /** */
  },
};

const AccountDataContext = createContext<AccountData>(defaultAccountData);

const AccountProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setActiveAccount = (acct: any) => {
    dispatch({ type: 'SET_ACTIVE_ACCOUNT', payload: acct });
  };

  const connectWallet = () => {
    dispatch({ type: 'LOAD_KEYRING' });
    const asyncLoadAccounts = async () => {
      try {
        const extensionDapp = await import('@polkadot/extension-dapp');
        const { web3Accounts, web3Enable } = extensionDapp;
        await web3Enable('Corehub');
        const accounts: InjectedAccountWithMeta[] = await web3Accounts();
        dispatch({ type: 'KEYRING_READY' });
        dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
        if (accounts.length)
          dispatch({ type: 'SET_ACTIVE_ACCOUNT', payload: accounts[0] });
      } catch (e) {
        dispatch({ type: 'KEYRING_ERROR' });
      }
    };
    asyncLoadAccounts();
  };

  useEffect(() => {
    const getInjector = async () => {
      if (!state.activeAccount) return;
      const { web3FromSource } = await import('@polkadot/extension-dapp');
      const injector = await web3FromSource(state.activeAccount.meta.source);
      dispatch({ type: 'SET_ACTIVE_SIGNER', payload: injector.signer });
    };
    getInjector();
  }, [state.activeAccount]);

  const disconnectWallet = () => dispatch({ type: 'DISCONNECT' });

  return (
    <AccountDataContext.Provider
      value={{ state, setActiveAccount, connectWallet, disconnectWallet }}
    >
      {children}
    </AccountDataContext.Provider>
  );
};

const useAccounts = () => useContext(AccountDataContext);

export { AccountProvider, useAccounts };
