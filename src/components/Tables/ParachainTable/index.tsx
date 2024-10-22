import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderRounded';
import StarIcon from '@mui/icons-material/StarRounded';
import { Button, IconButton, Paper, Stack, styled, Typography } from '@mui/material';
import { TableComponent } from '@region-x/components';
import { TableData } from '@region-x/components/dist/types/types';
import Image from 'next/image';
import React from 'react';

import { Link } from '@/components/Elements';
import { LeaseStateCard, ParaStateCard } from '@/components/Paras';

import { SUSBCAN_RELAY_URL } from '@/consts';
import { useRelayApi } from '@/contexts/apis';
import { useNetwork } from '@/contexts/network';
import { ParachainInfo, ParaState } from '@/models';

import Unknown from '../../../assets/unknown.svg';

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

export const ParachainTable = ({ parachains, handlers }: ParachainTableProps) => {
  const { onRegister, onUpgrade, onBuy, onRenew, onWatch } = handlers;

  const { network } = useNetwork();
  const {
    state: { height },
  } = useRelayApi();

  const formatTableData = (data: ParachainInfo[]): Record<string, TableData>[] => {
    const formattedData: Record<string, TableData>[] = data.map(
      ({ id, core, name, state, watching, logo, homepage }) => {
        return {
          Id: {
            cellType: 'link',
            data: id.toString(),
            link: `${SUSBCAN_RELAY_URL[network]}/parachain/${id}`,
          },
          Name: {
            cellType: 'jsx',
            data: (
              <Stack direction='row' alignItems='center' gap='0.5rem'>
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
                  <img src={logo} alt='' width={32} height={32} style={{ borderRadius: '100%' }} />
                )}
                {homepage === undefined ? (
                  <>{name || 'Unknown'}</>
                ) : (
                  <Link href={homepage} target='_blank'>
                    {name || 'Unknown'}
                  </Link>
                )}
              </Stack>
            ),
            searchKey: name || 'Unknown',
          },
          State: {
            cellType: 'jsx',
            data: <ParaStateCard state={state} />,
            searchKey: ParaState[state],
          },
          Expiry: {
            cellType: 'jsx',
            data:
              state === ParaState.SYSTEM ? <></> : <LeaseStateCard paraId={id} height={height} />,
          },
          Action: {
            cellType: 'jsx',
            data:
              state === ParaState.RESERVED ? (
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
              ),
          },
          Watchlist: {
            cellType: 'jsx',
            data: (
              <IconButton onClick={() => onWatch(id, watching ? false : true)}>
                {watching ? (
                  <StarIcon color='success' />
                ) : (
                  <StarBorderOutlinedIcon color='action' />
                )}
              </IconButton>
            ),
          },
        };
      }
    );

    return formattedData;
  };

  return (
    <Paper>
      <TableComponent data={formatTableData(parachains)} pageSize={10} />
    </Paper>
  );
};
