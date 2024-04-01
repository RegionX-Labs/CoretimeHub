import DashboardIcon from '@mui/icons-material/Dashboard';
import ExploreIcon from '@mui/icons-material/Explore';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Box, useTheme } from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useRouter } from 'next/router';
import React from 'react';

import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { TransferIcon } from '@/icons';

import styles from './index.module.scss';
import { StatusIndicator } from '../Elements';

interface MenuItemProps {
  label: string;
  enabled: boolean;
  route?: string;
  icon?: any;
}

const MenuItem = ({ label, enabled, route, icon }: MenuItemProps) => {
  const { pathname, push } = useRouter();
  const isActive = pathname === route;

  return (
    <Box
      className={`${styles.menuItem} ${
        isActive ? styles.active : styles.inactive
      } ${!enabled ? styles.disabled : ''}`}
      onClick={() => enabled && route && push(route)}
    >
      {{
        ...icon,
      }}
      <span>{label}</span>
    </Box>
  );
};

export const Sidebar = () => {
  const theme = useTheme();
  const {
    state: { apiState: relayApiState },
  } = useRelayApi();
  const {
    state: { apiState: coretimeApiState },
  } = useCoretimeApi();
  const { isConnected, isConnecting, error, api } = useInkathon();

  const contractsApiState =
    api && isConnected
      ? ApiState.READY
      : isConnecting
        ? ApiState.CONNECTING
        : error
          ? ApiState.ERROR
          : ApiState.DISCONNECTED;

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
        icon: <TransferIcon color='#7e8591' />,
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
        enabled: true,
        icon: <ExploreIcon />,
      },
    ],
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.menuContainer}>
        {Object.entries(menu).map(([label, submenu], index) => (
          <Box
            key={index}
            sx={{
              color: theme.palette.text.secondary,
              textTransform: 'capitalize',
              marginBottom: '2em',
            }}
          >
            {label}
            {submenu.map((item, index) => (
              <MenuItem key={index} {...item} />
            ))}
          </Box>
        ))}
      </div>
      <div className={styles.statusContainer}>
        <StatusIndicator state={relayApiState} label='Relay chain' />
        <StatusIndicator state={coretimeApiState} label='Coretime chain' />
        <StatusIndicator state={contractsApiState} label='Contracts chain' />
      </div>
    </div>
  );
};
