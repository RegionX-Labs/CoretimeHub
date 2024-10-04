import { Stack } from '@mui/material';
import { TableComponent } from '@region-x/components';
import { TableData } from '@region-x/components/dist/types/types';
import { useState } from 'react';

import { SaleDetailsModal } from '@/components';

import { SalesHistoryItem } from '@/models';

interface SalesHistoryTableProps {
  data: SalesHistoryItem[];
}

export const SalesHistoryTable = ({ data }: SalesHistoryTableProps) => {
  const [saleDetailsModalOpen, openSaleDetailsModal] = useState(false);
  const [saleSelected, selectSale] = useState<SalesHistoryItem | null>(null);

  const formatTableData = (data: SalesHistoryItem[]): Record<string, TableData>[] => {
    const formattedData: Record<string, TableData>[] = data.map((row, index) => {
      return {
        SaleId: {
          cellType: 'jsx',
          data: (
            <a
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => {
                selectSale(data[index]);
                openSaleDetailsModal(true);
              }}
            >
              {row.saleCycle}
            </a>
          ),
        },
        RegionBegin: {
          cellType: 'text',
          data: row.regionBegin.toString(),
        },
        RegionEnd: {
          cellType: 'text',
          data: row.regionEnd.toString(),
        },
        SaleStart: {
          cellType: 'text',
          data: row.startBlock.toString(),
        },
        SaleEnd: {
          cellType: 'text',
          data: row.endBlock ? row.endBlock.toString() : '-',
        },
      };
    });

    return formattedData;
  };

  return (
    <Stack direction='column' gap='1em'>
      <TableComponent data={formatTableData(data)} pageSize={10} />
      {saleSelected !== null ? (
        <SaleDetailsModal
          open={saleDetailsModalOpen}
          onClose={() => openSaleDetailsModal(false)}
          info={saleSelected}
        />
      ) : (
        <></>
      )}
    </Stack>
  );
};
