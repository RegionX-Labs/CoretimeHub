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
  Tooltip,
} from '@mui/material';
import { useState } from 'react';

import {
  getBalanceString,
  getRelativeTimeString,
  getTimeStringLong,
} from '@/utils/functions';

import { Address, Link } from '@/components/Elements';
import { OrderDetailsModal } from '@/components/Orders';

import { SUSBCAN_CORETIME_URL } from '@/consts';
import { useRelayApi } from '@/contexts/apis';
import { useNetwork } from '@/contexts/network';
import { OrderItem } from '@/models';

import { StyledTableCell, StyledTableRow } from '../common';

interface OrderProcessorTableProps {
  data: OrderItem[];
}

export const OrderProcessorTable = ({ data }: OrderProcessorTableProps) => {
  const { network } = useNetwork();
  const {
    state: { decimals, symbol },
  } = useRelayApi();

  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);

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
    <>
      <Stack direction='column' gap='1em'>
        <TableContainer component={Paper} sx={{ height: '32rem' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>Order Id</StyledTableCell>
                <StyledTableCell>Extrinsic</StyledTableCell>
                <StyledTableCell>Who</StyledTableCell>
                <StyledTableCell>Reward</StyledTableCell>
                <StyledTableCell>Timestamp</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? data.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : data
              ).map(
                (
                  { orderId, height, extrinsicId, account, reward, timestamp },
                  index
                ) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell align='center'>
                      <Button onClick={() => setActiveOrderId(orderId)}>
                        {orderId}
                      </Button>
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      {height}-{extrinsicId}
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      <Link
                        href={`${SUSBCAN_CORETIME_URL[network]}/account/${account}`}
                        target='_blank'
                      >
                        <Address
                          value={account}
                          isCopy={true}
                          isShort={true}
                          size={24}
                          center={true}
                        />
                      </Link>
                    </StyledTableCell>
                    <StyledTableCell align='center'>
                      {getBalanceString(reward.toString(), decimals, symbol)}
                    </StyledTableCell>
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
      {activeOrderId !== null ? (
        <OrderDetailsModal
          open
          onClose={() => setActiveOrderId(null)}
          orderId={activeOrderId}
        />
      ) : (
        <></>
      )}
    </>
  );
};
