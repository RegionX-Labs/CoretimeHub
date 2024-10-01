import { Stack } from '@mui/material';
import { TableComponent } from '@region-x/components';
import { TableData } from '@region-x/components/dist/types/types';

import { getBalanceString, getRelativeTimeString } from '@/utils/functions';

import { SUSBCAN_CORETIME_URL } from '@/consts';
import { useCoretimeApi } from '@/contexts/apis';
import { useNetwork } from '@/contexts/network';
import { PurchaseHistoryItem } from '@/models';

interface PurchaseHistoryTableProps {
  data: PurchaseHistoryItem[];
}

export const PurchaseHistoryTable = ({ data }: PurchaseHistoryTableProps) => {
  const { network } = useNetwork();
  const {
    state: { symbol, decimals },
  } = useCoretimeApi();

  const formatDataForTable = (data: PurchaseHistoryItem[]): Record<string, TableData>[] => {
    const formattedData: Array<Record<string, TableData>> = data.map(
      ({ address, core, extrinsicId, timestamp, price, type }) => {
        return {
          ExtrinsicID: {
            cellType: 'link',
            data: extrinsicId,
            link: `${SUSBCAN_CORETIME_URL[network]}/extrinsic/${extrinsicId}`,
          },
          Account: {
            cellType: 'address',
            data: address,
          },
          Core: {
            cellType: 'text',
            data: core.toString(),
          },
          [`Price (${symbol})`]: {
            cellType: 'text',
            data: getBalanceString(price.toString(), decimals, ''),
          },
          SalesType: {
            cellType: 'text',
            data: type.toString(),
          },
          Timestamp: {
            cellType: 'text',
            data: getRelativeTimeString(timestamp),
          },
        };
      }
    );

    return formattedData;
  };

  return (
    <Stack>
      <Stack alignItems='center'>
        <TableComponent data={formatDataForTable(data)} pageSize={10} />
      </Stack>
    </Stack>
  );
};
