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
  Tooltip,
} from '@mui/material';
import { useState } from 'react';

import {
  getBalanceString,
  getRelativeTimeString,
  getTimeStringLong,
} from '@/utils/functions';

import { Address, Link } from '@/components/Elements';

import { SUSBCAN_CORETIME_URL } from '@/consts';
import { useCoretimeApi } from '@/contexts/apis';
import { useNetwork } from '@/contexts/network';
import { PurchaseHistoryItem } from '@/models';

import { StyledTableCell, StyledTableRow } from '../common';

interface PurchaseHistoryTableProps {
  data: PurchaseHistoryItem[];
}

export const PurchaseHistoryTable = ({ data }: PurchaseHistoryTableProps) => {
  const { network } = useNetwork();
  const {
    state: { symbol, decimals },
  } = useCoretimeApi();

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
      <TableContainer component={Paper} sx={{ height: '32rem' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>Extrinsic Id</StyledTableCell>
              <StyledTableCell>Account</StyledTableCell>
              <StyledTableCell>Core</StyledTableCell>
              <StyledTableCell>{`Price (${symbol})`}</StyledTableCell>
              <StyledTableCell>Sales Type</StyledTableCell>
              <StyledTableCell>Timestamp</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : data
            ).map(
              (
                {
                  address,
                  core,
                  extrinsicId: extrinsic_index,
                  timestamp,
                  price,
                  type,
                },
                index
              ) => (
                <StyledTableRow key={index}>
                  <StyledTableCell align='center'>
                    <Link
                      href={`${SUSBCAN_CORETIME_URL[network]}/extrinsic/${extrinsic_index}`}
                      target='_blank'
                    >
                      {extrinsic_index}
                    </Link>
                  </StyledTableCell>
                  <StyledTableCell align='center'>
                    <Link
                      href={`${SUSBCAN_CORETIME_URL[network]}/account/${address}`}
                      target='_blank'
                    >
                      <Address
                        value={address}
                        isCopy={true}
                        isShort={true}
                        size={24}
                      />
                    </Link>
                  </StyledTableCell>
                  <StyledTableCell align='center'>{core}</StyledTableCell>
                  <StyledTableCell align='center'>
                    {getBalanceString(price.toString(), decimals, '')}
                  </StyledTableCell>
                  <StyledTableCell align='center'>{type}</StyledTableCell>
                  <StyledTableCell align='center'>
                    <Tooltip title={getTimeStringLong(timestamp)}>
                      <p>{getRelativeTimeString(timestamp)}</p>
                    </Tooltip>
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
