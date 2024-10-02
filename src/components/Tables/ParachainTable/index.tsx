import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNewRounded';
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

import { Link } from '@/components/Elements';

import { SUSBCAN_RELAY_URL } from '@/consts';
import { useRelayApi } from '@/contexts/apis';
import { useNetwork } from '@/contexts/network';
import { ParachainInfo, ParaState } from '@/models';

import { StyledTableCell, StyledTableRow } from '../common';
import { CoreExpiryCard } from '../../Paras/CoreExpiryCard';
import { LeaseStateCard } from '../../Paras/LeaseStateCard';
import { ParaStateCard } from '../../Paras/ParaStateCard';
import Unknown from '../../../assets/unknown.svg';
import { TableComponent } from '@region-x/components';
import { TableData } from '@region-x/components/dist/types/types';

export type Order = 'asc' | 'desc';

interface ParachainTableProps {
  parachains: ParachainInfo[];
  handlers: {
    onRegister: (_id: number) => void;
    onUpgrade: (_id: number) => void;
    onBuy: () => void;
    onWatch: (_id: number, _watching: boolean) => void;
    onRenew: (_id: number, _core: number) => void;
  };
}

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
}: ParachainTableProps) => {
  const theme = useTheme();

  const { onRegister, onUpgrade, onBuy, onRenew, onWatch } = handlers;

  const { network } = useNetwork();

  const formatTableData = (data: ParachainInfo[]): Record<string, TableData>[] => {
    const formattedData: Record<string, TableData>[] = parachains.map(({ id, core, name, state, watching, logo, homepage }, index) => {
      return {
        Id: {
          cellType: 'link',
          data: id.toString(),
          link: `${SUSBCAN_RELAY_URL[network]}/parachain/${id}`
        },
        Name: {
          cellType: 'jsx',
          data: <Stack direction='row' alignItems='center' gap='0.5rem'>
            {/* TODO: support font awesome icons */}
            {!logo || logo?.startsWith('fa;') ? (
              <Image
                src={Unknown}
                alt=''
                width={32}
                height={32}
                style={{ borderRadius: '100%' }}
              />
            ) : (
              <img
                src={logo}
                alt=''
                width={32}
                height={32}
                style={{ borderRadius: '100%' }}
              />
            )}
            {homepage === undefined ? (
              <>{name || 'Unknown'}</>
            ) : (
              <Link href={homepage} target='_blank'>
                {name || 'Unknown'}
              </Link>
            )}
          </Stack>,
        },
        State: {
          cellType: 'jsx',
          data: <p>{state}</p>
        },
        Action: {
          cellType: 'jsx',
          data: state === ParaState.RESERVED ? (
            <ParaActionButton onClick={() => onRegister(id)}>Register</ParaActionButton>
          ) : state === ParaState.ONDEMAND_PARACHAIN ? (
            <ParaActionButton onClick={() => onUpgrade(id)}>
              Upgrade(Buy Coretime)
            </ParaActionButton>
          ) : state === ParaState.IDLE_PARA ? (
            <ParaActionButton onClick={onBuy}>Buy Coretime</ParaActionButton>
          ) : state === ParaState.ACTIVE_RENEWABLE_PARA ? (
            <ParaActionButton onClick={() => onRenew(id, core)}>
              Renew Coretime
            </ParaActionButton>
          ) : (
            <Typography>No action required</Typography>
          )
        },
        Watchlist: {
          cellType: 'jsx',
          data: <IconButton onClick={() => onWatch(id, watching ? false : true)}>
            {watching ? (
              <StarIcon color='success' />
            ) : (
              <StarBorderOutlinedIcon color='action' />
            )}
          </IconButton>
        }
      }
    });

    return formattedData;
  }

  return (
    <Paper>
      <TableComponent data={formatTableData(parachains)} pageSize={10} />
    </Paper>
  );
};
