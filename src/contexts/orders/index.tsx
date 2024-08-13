import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { getOrderAccount } from '@/utils/order';

import { ContextStatus, OnChainOrder, Order, RELAY_ASSET_ID } from '@/models';

import { useAccounts } from '../account';
import { useRegionXApi } from '../apis';
import { ApiState } from '../apis/types';

interface OrderData {
  status: ContextStatus;
  orders: Array<Order>;
  fetchOrders: () => void;
}

const defaultOrderData: OrderData = {
  status: ContextStatus.UNINITIALIZED,
  orders: [],
  fetchOrders: () => {
    /** */
  },
};

const OrderDataContext = createContext<OrderData>(defaultOrderData);

interface Props {
  children: React.ReactNode;
}

const OrderProvider = ({ children }: Props) => {
  const [status, setStatus] = useState(ContextStatus.UNINITIALIZED);
  const [orders, setOrders] = useState<Order[]>([]);

  const {
    state: { activeAccount },
  } = useAccounts();
  const {
    state: { api, apiState },
  } = useRegionXApi();

  const fetchOrders = useCallback(async () => {
    if (!api || apiState !== ApiState.READY) {
      return;
    }
    try {
      setStatus(ContextStatus.LOADING);

      // fetch orders
      const orderEntries = await api.query.orders.orders.entries();
      const records: Order[] = [];

      for await (const [key, value] of orderEntries) {
        const [orderId] = key.toHuman() as [number];
        const orderAccount = getOrderAccount(api, orderId);

        const obj = value.toJSON() as OnChainOrder;

        const totalContribution = (
          (
            await api.query.tokens.accounts(
              orderAccount.toString(),
              RELAY_ASSET_ID
            )
          ).toJSON() as any
        ).free;
        const contribution = (
          await api.query.orders.contributions(orderId, activeAccount?.address)
        ).toJSON() as number;

        records.push({
          ...obj,
          orderId,
          contribution,
          totalContribution,
        } as Order);
      }
      setOrders(records);

      setStatus(ContextStatus.LOADED);
    } catch (e) {
      setStatus(ContextStatus.ERROR);
      setOrders([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, apiState, activeAccount]);

  useEffect(() => {
    fetchOrders();
  }, [api, apiState, activeAccount, fetchOrders]);

  return (
    <OrderDataContext.Provider value={{ status, orders, fetchOrders }}>
      {children}
    </OrderDataContext.Provider>
  );
};

const useOrders = () => useContext(OrderDataContext);

export { OrderProvider, useOrders };
