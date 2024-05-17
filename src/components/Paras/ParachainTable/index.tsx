import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Button,
  IconButton,
  Paper,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { ParachainInfo, ParaState } from '@/models';

import { LeaseStateCard } from '../LeaseStateCard';
import { ParaStateCard } from '../ParaStateCard';

interface ParachainTableProps {
  parachains: ParachainInfo[];
  handlers: {
    onRegister: (_id: number) => void;
    onUpgrade: (_id: number) => void;
    onBuy: () => void;
    onWatch: (_id: number, _watching: boolean) => void;
    onRenew: (_id: number) => void;
  };
}

export const ParachainTable = ({
  parachains,
  handlers,
}: ParachainTableProps) => {
  const { onRegister, onUpgrade, onBuy, onRenew, onWatch } = handlers;

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
      fontSize: '1rem',
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  // table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const [height, setHeight] = useState(0);

  const paraActionStyle = ({ theme }: any) => ({
    width: '12rem',
    borderRadius: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
  });

  const ParaActionButton = styled(Button)(paraActionStyle);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
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

  useEffect(() => {
    const fetchHeight = async () => {
      if (!relayApi || relayApiState !== ApiState.READY) return;
      const data = await relayApi.query.system.number();
      const height = data.toJSON() as number;
      setHeight(height);
    };

    fetchHeight();
  }, [relayApi, relayApiState]);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell>Para ID</StyledTableCell>
            <StyledTableCell>Para Name</StyledTableCell>
            <StyledTableCell>State</StyledTableCell>
            <StyledTableCell>Action</StyledTableCell>
            <StyledTableCell>Watchlist</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? parachains.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
            : parachains
          ).map(({ id, name, state, watching }, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{id}</StyledTableCell>
              <StyledTableCell>{name}</StyledTableCell>
              <StyledTableCell>
                <Stack direction='row' gap='2rem' alignItems='center'>
                  <ParaStateCard state={state} />
                  {/* System paras have reserved coretime */}
                  {state != ParaState.SYSTEM && (
                    <LeaseStateCard paraId={id} height={height} />
                  )}
                </Stack>
              </StyledTableCell>
              <StyledTableCell>
                {state === ParaState.RESERVED ? (
                  <ParaActionButton
                    onClick={() => onRegister(id)}
                    variant='outlined'
                  >
                    Register
                  </ParaActionButton>
                ) : state === ParaState.ONDEMAND_PARACHAIN ? (
                  <ParaActionButton
                    variant='outlined'
                    onClick={() => onUpgrade(id)}
                  >
                    Upgrade(Buy Coretime)
                  </ParaActionButton>
                ) : state === ParaState.IDLE_PARA ? (
                  <ParaActionButton variant='outlined' onClick={onBuy}>
                    Buy Coretime
                  </ParaActionButton>
                ) : state === ParaState.ACTIVE_PARA ? (
                  <ParaActionButton
                    variant='outlined'
                    onClick={() => onRenew(id)}
                  >
                    Renew Coretime
                  </ParaActionButton>
                ) : (
                  <Typography>No action required</Typography>
                )}
              </StyledTableCell>
              <StyledTableCell>
                <IconButton
                  onClick={() => onWatch(id, watching ? false : true)}
                >
                  {watching ? (
                    <VisibilityIcon color='success' />
                  ) : (
                    <VisibilityOffIcon color='action' />
                  )}
                </IconButton>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[10, 25, { label: 'All', value: -1 }]}
              colSpan={3}
              count={parachains.length}
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
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};
