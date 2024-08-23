import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { useState } from 'react';

import { getTimeStringLong } from '@/utils/functions';

import { SaleDetailsModal } from '@/components';

import { SalesHistoryItem } from '@/models';

import { StyledTableCell, StyledTableRow } from '../common';

interface SalesHistoryTableProps {
  data: SalesHistoryItem[];
}

export const SalesHistoryTable = ({ data }: SalesHistoryTableProps) => {
  // table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [saleDetailsModalOpen, openSaleDetailsModal] = useState(false);
  const [saleSelected, selectSale] = useState<SalesHistoryItem | null>(null);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Stack direction='column' gap='1em'>
      <TableContainer component={Paper} sx={{ height: '35rem' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>Sale Id</StyledTableCell>
              <StyledTableCell>Region Begin</StyledTableCell>
              <StyledTableCell>Region End</StyledTableCell>
              <StyledTableCell>Sale Start</StyledTableCell>
              <StyledTableCell>Sale End</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : data
            ).map((info, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell align='center'>
                  <Button
                    onClick={() => {
                      openSaleDetailsModal(true);
                      selectSale(info);
                    }}
                  >
                    {info.saleCycle}
                  </Button>
                </StyledTableCell>
                <StyledTableCell align='center'>{info.regionBegin}</StyledTableCell>
                <StyledTableCell align='center'>{info.regionEnd}</StyledTableCell>
                <StyledTableCell align='center'>
                  {getTimeStringLong(info.startTimestamp)}
                </StyledTableCell>
                <StyledTableCell align='center'>
                  {info.endTimestamp ? getTimeStringLong(info.endTimestamp) : 'Not yet ended'}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack alignItems='center'>
        <Table>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 25, { label: 'All', value: -1 }]}
                colSpan={3}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                slotProps={{
                  select: {
                    inputProps: {
                      'aria-label': 'rows per page',
                    },
                    native: true,
                  },
                }}
                sx={{
                  '.MuiTablePagination-spacer': {
                    flex: '0 0 0',
                  },
                  '.MuiTablePagination-toolbar': {
                    justifyContent: 'center',
                  },
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </Stack>
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
