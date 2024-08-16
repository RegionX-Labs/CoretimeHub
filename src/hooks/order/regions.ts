import { useEffect, useState } from 'react';

import { fetchCocosRegions } from '@/apis';
import { useAccounts } from '@/contexts/account';
import { ApiResponse, Region } from '@/models';

export const useRegions = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Region[]>([]);
  const [isError, setError] = useState(false);

  const {
    state: { activeAccount },
  } = useAccounts();

  useEffect(() => {
    const asyncFetchData = async () => {
      setData([]);
      setError(false);
      setLoading(false);

      if (!activeAccount) return;

      try {
        setLoading(true);
        let finished = false;
        let after: string | null = null;

        const result = [];
        while (!finished) {
          const res: ApiResponse = await fetchCocosRegions(after, {
            status: { equalTo: 'unavailable' },
            account: { equalTo: activeAccount.address },
          });

          const {
            status,
            data: {
              regions: { nodes, pageInfo },
            },
          } = res;
          if (status !== 200) break;

          if (nodes !== null) result.push(...nodes);

          finished = !pageInfo.hasNextPage;
          after = pageInfo.endCursor;
        }
        if (!finished) {
          setError(true);
        } else {
          setData(
            result.map(
              ({ begin, end, core, mask }) =>
                ({
                  begin,
                  end,
                  core,
                  mask,
                } as Region)
            )
          );
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    asyncFetchData();
  }, [activeAccount]);

  return {
    loading,
    data,
    isError,
  };
};
