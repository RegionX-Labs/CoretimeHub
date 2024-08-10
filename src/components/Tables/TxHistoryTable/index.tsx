import { Check, Close } from '@mui/icons-material';
import {
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
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useState } from 'react';

import { Link } from '@/components/Elements';

import { SUSBCAN_CORETIME_URL } from '@/consts';
import { useNetwork } from '@/contexts/network';
import { AccountTxHistoryItem } from '@/models';

import { StyledTableCell, StyledTableRow } from '../common';

interface TxHistoryTableProps {
  data: AccountTxHistoryItem[];
}

export const TxHistoryTable = ({ data }: TxHistoryTableProps) => {
  TimeAgo.addLocale(en);
  // Create formatter (English).
  const timeAgo = new TimeAgo('en-US');

  const { network } = useNetwork();

  // table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
              <StyledTableCell>Extrinsic Id</StyledTableCell>
              <StyledTableCell>Module</StyledTableCell>
              <StyledTableCell>Method</StyledTableCell>
              <StyledTableCell>Success</StyledTableCell>
              <StyledTableCell>Timestamp</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : data
            ).map(
              ({ module, call, extrinsicId, success, timestamp }, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell align='center'>
                    <Link
                      href={`${SUSBCAN_CORETIME_URL[network]}/extrinsic/${extrinsicId}`}
                      target='_blank'
                    >
                      {extrinsicId}
                    </Link>
                  </StyledTableCell>
                  <StyledTableCell align='center'>{module}</StyledTableCell>
                  <StyledTableCell align='center'>{call}</StyledTableCell>
                  <StyledTableCell align='center'>
                    {success ? (
                      <Check color='success' />
                    ) : (
                      <Close color='error' />
                    )}
                  </StyledTableCell>
                  <StyledTableCell align='center'>
                    {timeAgo.format(timestamp, 'round-minute')}
                  </StyledTableCell>
                </StyledTableRow>
              )
            )}
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
    </Stack>
  );
};
