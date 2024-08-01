import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExploreIcon from '@mui/icons-material/Explore';
import HomeIcon from '@mui/icons-material/Home';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { enableRegionX } from '@/utils/functions';

import Logo from '@/assets/logo.png';
import { useCoretimeApi, useRegionXApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';
import { RenewIcon } from '@/icons';

import styles from './index.module.scss';
import { StatusIndicator } from '../Elements';

interface MenuItemProps {
  label: string;
  enabled: boolean;
  route?: string;
  icon?: any;
}

const MenuItem = ({ label, enabled, route, icon }: MenuItemProps) => {
  const { pathname, push, query } = useRouter();
  const isActive = pathname === route;
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: enabled ? 'pointer' : 'not-allowed',
        padding: '0.5rem 0.75rem',
        textTransform: 'capitalize',
        color: enabled
          ? theme.palette.text.primary
          : theme.palette.text.disabled,
        fontSize: '0.8rem',
        marginBottom: '0.25rem',
        ...(isActive
          ? {
              color: theme.palette.common.black,
              background: theme.palette.primary.contrastText,
              borderRadius: '1rem',
            }
          : {}),
        ':hover': {
          opacity: 0.8,
        },
      }}
      onClick={() => enabled && route && push({ pathname: route, query })}
    >
      <span className={styles.menuIcon}>{{ ...icon }}</span>
      <span
        className={`${styles.menuItem} ${!enabled ? 'disabled' : ''} ${
          isActive ? 'active' : ''
        }`}
      >
        {label}
      </span>
      {isActive && <span className={styles.active}></span>}
    </Box>
  );
};

export const Sidebar = () => {
  const theme = useTheme();

  const { network } = useNetwork();
  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();
  const {
    state: { api: regionXApi, apiState: regionxApiState },
  } = useRegionXApi();

  const menu = {
    general: [
      {
        label: 'Home',
        route: '/',
        enabled: true,
        icon: <HomeIcon />,
      },
      {
        label: 'My Regions',
        route: '/regions',
        enabled: true,
        icon: <DashboardIcon />,
      },
      {
        label: 'Cross-chain transfer',
        route: '/transfer',
        enabled: true,
        icon: <SwapHorizOutlinedIcon />,
      },
    ],
    parachains: [
      {
        label: 'Renew',
        route: '/paras/renewal',
        enabled: true,
        icon: <RenewIcon color={theme.palette.text.primary} />,
      },
      {
        label: 'Manage',
        route: '/paras',
        enabled: true,
        icon: <BuildRoundedIcon />,
      },
    ],
    'primary market': [
      {
        label: 'Purchase a core',
        route: '/purchase',
        enabled: true,
        icon: <ShoppingCartIcon />,
      },
    ],
    'secondary market': [
      {
        label: 'Explore the Market',
        route: '/marketplace',
        enabled: enableRegionX(network),
        icon: <ExploreIcon />,
      },
      {
        label: 'Orders',
        route: '/orders',
        enabled: enableRegionX(network),
        icon: <ListOutlinedIcon />,
      },
    ],
  };

  const getApiState = (api: any, state: ApiState) => {
    if (!api) return ApiState.DISCONNECTED;
    return state;
  };

  return (
    <div className={styles.sidebar}>
      <Box
        sx={{
          display: 'flex',
          borderBottom: `1px solid ${theme.palette.divider}`,
          padding: '1rem 0',
        }}
      >
        <Link href='/' className={styles.logo}>
          <Image src={Logo} alt='logo' />
        </Link>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          fontSize: '1rem',
          padding: '2rem 1.5rem',
        }}
      >
        <Stack direction='column' gap='1rem' flexGrow={1}>
          {Object.entries(menu).map(([label, submenu], index) => (
            <Box
              key={index}
              sx={{
                color: theme.palette.text.secondary,
                textTransform: 'capitalize',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.75em',
                  textTransform: 'uppercase',
                  color: theme.palette.text.primary,
                  mb: '0.5rem',
                }}
              >
                {label}
              </Typography>
              {submenu.map((item, index) => (
                <MenuItem key={index} {...item} />
              ))}
            </Box>
          ))}
        </Stack>
        <div className={styles.statusContainer}>
          <StatusIndicator
            state={getApiState(relayApi, relayApiState)}
            label='Relay chain'
          />
          <StatusIndicator
            state={getApiState(coretimeApi, coretimeApiState)}
            label='Coretime chain'
          />
          {enableRegionX(network) && (
            <StatusIndicator
              state={getApiState(regionXApi, regionxApiState)}
              label='RegionX chain'
            />
          )}
        </div>
      </Box>
    </div>
  );
};
