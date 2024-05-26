import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderRounded';
import StarIcon from '@mui/icons-material/StarRounded';
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
  useTheme,
} from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { ParachainInfo, ParaState } from '@/models';

import { CoreExpiryCard } from '../CoreExpiryCard';
import { LeaseStateCard } from '../LeaseStateCard';
import { ParaStateCard } from '../ParaStateCard';

export type Order = 'asc' | 'desc';

interface ParachainTableProps {
  parachains: ParachainInfo[];
  handlers: {
    onRegister: (_id: number) => void;
    onUpgrade: (_id: number) => void;
    onBuy: () => void;
    onWatch: (_id: number, _watching: boolean) => void;
    onRenew: (_id: number) => void;
  };
  orderBy: string;
  direction: Order;
  handleSort: (_orderBy: string, _direction: Order) => void;
}

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

const ParaActionButton = styled(Button)(({ theme }: any) => ({
  width: 'mind-width',
  fontWeight: 'bold',
  padding: 0,
  color: theme.palette.primary.main,
  display: 'flex',
  justifyContent: 'flex-start',
}));

export const ParachainTable = ({
  parachains,
  handlers,
  orderBy,
  direction,
  handleSort,
}: ParachainTableProps) => {
  const theme = useTheme();

  const { onRegister, onUpgrade, onBuy, onRenew, onWatch } = handlers;

  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const { network } = useNetwork();

  // table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [height, setHeight] = useState(0);

  const headers = [
    { name: 'Para ID', sort: 'id' },
    { name: 'Para Name' },
    { name: 'State' },
    { name: 'Expiry', sort: 'expiry' },
    { name: 'Action' },
    { name: 'Watchlist' },
  ];

  const initialDir: Record<string, Order> = {
    id: 'asc',
    expiry: 'asc',
  };

  const [dir, setDir] = useState(initialDir);

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

  useEffect(() => {
    const fetchHeight = async () => {
      if (!relayApi || relayApiState !== ApiState.READY) return;
      const data = await relayApi.query.system.number();
      const height = data.toJSON() as number;
      setHeight(height);
    };

    fetchHeight();
  }, [relayApi, relayApiState]);

  useEffect(() => {
    setDir(initialDir);
  }, []);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {headers.map(({ name, sort }, index) => (
              <StyledTableCell key={index}>
                {sort !== undefined && (
                  <IconButton
                    sx={{
                      color:
                        sort === orderBy
                          ? theme.palette.common.white
                          : theme.palette.grey['200'],
                    }}
                    onClick={() => {
                      let newDir: Order = direction === 'asc' ? 'desc' : 'asc';
                      if (sort !== orderBy) newDir = dir[sort];
                      handleSort(sort, newDir);
                      setDir({ ...dir, [sort]: newDir });
                    }}
                  >
                    {dir[sort] === 'asc' ? (
                      <ArrowUpward fontSize='small' />
                    ) : (
                      <ArrowDownward fontSize='small' />
                    )}
                  </IconButton>
                )}

                {name}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? parachains.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
            : parachains
          ).map(({ id, name, state, watching, logo }, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell style={{ width: '10%' }}>
                <Button
                  onClick={() => {
                    window.open(
                      `https://${network}.subscan.io/parachain/${id}`
                    );
                  }}
                >
                  {id}
                </Button>
              </StyledTableCell>
              <StyledTableCell style={{ width: '25%' }}>
                <Stack direction='row' alignItems='center' gap='1rem'>
                  {logo === undefined ? (
                    <></>
                  ) : (
                    <Image
                      src={logo}
                      alt=''
                      width={32}
                      height={32}
                      style={{ borderRadius: '100%' }}
                    />
                  )}
                  {name}
                </Stack>
              </StyledTableCell>
              <StyledTableCell style={{ margin: 0, width: '20%' }}>
                <ParaStateCard state={state} />
              </StyledTableCell>
              <StyledTableCell style={{ width: '25%' }}>
                {/* System paras have reserved coretime */}
                {state != ParaState.SYSTEM && (
                  <Stack>
                    <LeaseStateCard paraId={id} height={height} />
                    <CoreExpiryCard paraId={id} height={height} />
                  </Stack>
                )}
              </StyledTableCell>
              <StyledTableCell style={{ width: '20%' }}>
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
              <StyledTableCell style={{ width: '5%' }}>
                <IconButton
                  onClick={() => onWatch(id, watching ? false : true)}
                >
                  {watching ? (
                    <StarIcon color='success' />
                  ) : (
                    <StarBorderOutlinedIcon color='action' />
                  )}
                </IconButton>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
        <TableFooter
          sx={{
            position: 'fixed',
            bottom: '0.3rem',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
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
