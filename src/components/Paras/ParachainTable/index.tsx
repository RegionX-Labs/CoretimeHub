import {
  Button,
  Paper,
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
import React, { useState } from 'react';

import { ParachainInfo, ParaState } from '@/models';

import { ParaStateCard } from '../ParaStateCard';

interface ParachainTableProps {
  parachains: ParachainInfo[];
  handlers: {
    onRegister: (_id: number) => void;
    onUpgrade: (_id: number) => void;
    onBuy: () => void;
    onRenew: (_id: number) => void;
  };
}

export const ParachainTable = ({
  parachains,
  handlers,
}: ParachainTableProps) => {
  const { onRegister, onUpgrade, onBuy, onRenew } = handlers;

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

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell>Para ID</StyledTableCell>
            <StyledTableCell>Para Name</StyledTableCell>
            <StyledTableCell>State</StyledTableCell>
            <StyledTableCell>Action</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? parachains.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
            : parachains
          ).map(({ id, name, state }, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{id}</StyledTableCell>
              <StyledTableCell>{name}</StyledTableCell>
              <StyledTableCell>
                <ParaStateCard state={state} />
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
