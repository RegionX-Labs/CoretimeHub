import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { fetchContribution, fetchOrders as fetchOrdersApi } from '@/apis';
import { ApiResponse, ContextStatus, Order } from '@/models';

import { useAccounts } from '../account';

interface Contribution {
  amount: string;
}

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

  const fetchOrders = useCallback(async () => {
    const getContribution = async (orderId: number) => {
      let finished = false;
      let after: string | null = null;

      let sum = 0;
      while (!finished) {
        const res: ApiResponse = await fetchContribution(
          orderId,
          activeAccount?.address,
          after
        );

        const {
          status,
          data: {
            orderContributions: { nodes, pageInfo },
          },
        } = res;

        if (status !== 200 || nodes === null) break;

        sum += nodes.reduce(
          (acc: number, item: Contribution) => acc + parseInt(item.amount),
          0
        );

        finished = !pageInfo.hasNextPage;
        after = pageInfo.endCursor;
      }
      return sum;
    };

    try {
      setStatus(ContextStatus.LOADING);

      // fetch orders
      let finished = false;
      let after: string | null = null;

      const result = [];
      while (!finished) {
        const res: ApiResponse = await fetchOrdersApi(after);

        const {
          status,
          data: {
            orders: { nodes, pageInfo },
          },
        } = res;

        if (status !== 200 || nodes === null) break;

        result.push(...nodes);

        finished = !pageInfo.hasNextPage;
        after = pageInfo.endCursor;
      }
      if (!finished) {
        setStatus(ContextStatus.ERROR);
      } else {
        setOrders(
          await Promise.all(
            result.map(
              async (item) =>
                ({
                  ...item,
                  totalContribution: parseInt(item.contribution),
                  contribution: await getContribution(item.orderId),
                }) as Order
            )
          )
        );
      }

      setStatus(ContextStatus.LOADED);
    } catch (e) {
      setStatus(ContextStatus.ERROR);
      setOrders([]);
    }
  }, [activeAccount]);

  useEffect(() => {
    fetchOrders();
  }, [activeAccount, fetchOrders]);

  return (
    <OrderDataContext.Provider value={{ status, orders, fetchOrders }}>
      {children}
    </OrderDataContext.Provider>
  );
};

const useOrders = () => useContext(OrderDataContext);

export { OrderProvider, useOrders };
