import {
  Backdrop,
  Box,
  CircularProgress,
  FormControlLabel,
  Paper,
  Switch,
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
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';

import { ActionButton, RegisterModal, ReserveModal } from '@/components';

import chainData from '@/chaindata';
import { useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';

type ParaState = 'Parathread' | 'Parachain';

type ParachainInfo = {
  id: number;
  state: ParaState;
  name: string;
};

const ParachainManagement = () => {
  const theme = useTheme();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const { network } = useNetwork();

  const [watchAll, watchAllParas] = useState(true);
  const [loading, setLoading] = useState(false);

  const [parachains, setParachains] = useState<ParachainInfo[]>([]);
  const [nextParaId, setNextParaId] = useState<number>(0);
  const [reservationCost, setReservationCost] = useState<string>('0');

  const [reserveModalOpen, openReserveModal] = useState(false);
  const [registerModalOpen, openRegisterModal] = useState(false);

  // table pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

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
    const asyncLoad = async () => {
      if (relayApiState !== ApiState.READY || !relayApi) return;
      setLoading(true);

      const fetchParachainList = async () => {
        const parasRaw = await relayApi.query.paras.paraLifecycles.entries();
        const paras: ParachainInfo[] = [];
        for (const [key, value] of parasRaw) {
          const [strId] = key.toHuman() as [string];
          const id = parseInt(strId.replace(/,/g, ''));
          const state = value.toString();
          const name = chainData[network][id] ?? '';
          paras.push({ id, state, name } as ParachainInfo);
        }
        paras.sort((a, b) => a.id - b.id);

        setParachains(paras);
      };

      const fetchNextParaId = async () => {
        const idRaw = await relayApi.query.registrar.nextFreeParaId();
        const id = idRaw.toPrimitive() as number;
        setNextParaId(id);
      };

      const fetchReservationCost = () => {
        setReservationCost(relayApi.consts.registrar.paraDeposit.toString());
      };

      await Promise.all([
        fetchParachainList(),
        fetchNextParaId(),
        fetchReservationCost(),
      ]);

      setLoading(false);
    };

    asyncLoad();
  }, [relayApiState, relayApi, network]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Project Management
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Watch parachains state, register and manage parachains
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '2rem', height: '3.25rem' }}>
          <FormControlLabel
            control={
              <Switch
                color='success'
                checked={watchAll}
                onChange={(e) => watchAllParas(e.target.checked)}
              />
            }
            label='Watch all Paras'
            labelPlacement='start'
            sx={{
              color: theme.palette.common.black,
              background: theme.palette.common.white,
              border: `1px solid ${theme.palette.grey['200']}`,
              padding: '0.25rem 1.25rem',
              borderRadius: '5rem',
            }}
          />
          <ActionButton
            label='Reserve New Para'
            onClick={() => openReserveModal(true)}
          />
        </Box>
      </Box>
      {loading ? (
        <Backdrop open>
          <CircularProgress />
        </Backdrop>
      ) : (
        <Box sx={{ mt: '2rem', overflowY: 'auto' }}>
          <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Para ID</StyledTableCell>
                  <StyledTableCell>Para Name</StyledTableCell>
                  <StyledTableCell>State</StyledTableCell>
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
                    <StyledTableCell>{state}</StyledTableCell>
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
          <ReserveModal
            open={reserveModalOpen}
            onClose={() => openReserveModal(false)}
            paraId={nextParaId}
            reservationCost={reservationCost}
          />
          <RegisterModal
            open={registerModalOpen}
            onClose={() => openRegisterModal(false)}
            paraId={0}
            regCost='0'
          />
        </Box>
      )}
    </Box>
  );
};

export default ParachainManagement;
