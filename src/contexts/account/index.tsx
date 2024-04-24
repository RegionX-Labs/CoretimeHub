import type { Signer } from '@polkadot/api/types';
import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

export enum KeyringState {
  // eslint-disable-next-line no-unused-vars
  DISCONNECTED,
  // eslint-disable-next-line no-unused-vars
  LOADING,
  // eslint-disable-next-line no-unused-vars
  READY,
  // eslint-disable-next-line no-unused-vars
  ERROR,
}

type State = {
  status: KeyringState;
  accounts: InjectedAccountWithMeta[];
  activeAccount: InjectedAccountWithMeta | null;
  activeSigner: Signer | null;
};

const initialState: State = {
  status: KeyringState.LOADING,
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
    case 'SET_KEYRING':
      return {
        ...state,
        keyring: action.payload,
        keyringState: KeyringState.READY,
      };
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
    dispatch({ type: 'SET_CURRENT_ACCOUNT', payload: acct });
  };

  const connectWallet = () => {
    dispatch({ type: 'LOAD_KEYRING' });
    const asyncLoadAccounts = async () => {
      try {
        await web3Enable('Corehub');
        const accounts: InjectedAccountWithMeta[] = await web3Accounts();
        dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
      } catch (e) {
        dispatch({ type: 'KEYRING_ERROR' });
      }
    };
    asyncLoadAccounts();
  };

  useEffect(() => {
    const getInjector = async () => {
      if (!state.activeAccount) return;
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
