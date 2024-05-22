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
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { ParachainInfo, ParaState } from '@/models';

import styles from './index.module.scss';
import { CoreExpiryCard } from '../CoreExpiryCard';
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
      color: theme.palette.common.black,
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

  const { network } = useNetwork();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const [height, setHeight] = useState(0);

  const paraActionStyle = ({ theme }: any) => ({
    width: 'mind-width',
    fontWeight: 'bold',
    padding: 0,
    color: theme.palette.primary.main,
    display: 'flex',
    justifyContent: 'flex-start',
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
            <StyledTableCell>Expiry</StyledTableCell>
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
              <StyledTableCell>
                <Link
                  href={`https://${network}.subscan.io/parachain/${id}`}
                  target='_blank'
                  className={styles.paraId}
                >
                  {id}
                </Link>
              </StyledTableCell>
              <StyledTableCell>{name}</StyledTableCell>
              <StyledTableCell style={{ margin: 0 }}>
                <ParaStateCard state={state} />
              </StyledTableCell>
              <StyledTableCell>
                {/* System paras have reserved coretime */}
                {state != ParaState.SYSTEM && (
                  <Stack>
                    <LeaseStateCard paraId={id} height={height} />
                    <CoreExpiryCard paraId={id} height={height} />
                  </Stack>
                )}
              </StyledTableCell>
              <StyledTableCell>
                {state === ParaState.RESERVED ? (
                  <ParaActionButton onClick={() => onRegister(id)}>
                    Register
                  </ParaActionButton>
                ) : state === ParaState.ONDEMAND_PARACHAIN ? (
                  <ParaActionButton onClick={() => onUpgrade(id)}>
                    Upgrade(Buy Coretime)
                  </ParaActionButton>
                ) : state === ParaState.IDLE_PARA ? (
                  <ParaActionButton onClick={onBuy}>
                    Buy Coretime
                  </ParaActionButton>
                ) : state === ParaState.ACTIVE_PARA ? (
                  <ParaActionButton onClick={() => onRenew(id)}>
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
