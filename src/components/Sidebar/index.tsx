import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Box, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';

import styles from './index.module.scss';

interface MenuItemProps {
  label: string;
  route?: string;
  icon?: any;
}

const MenuItem = ({ label, route, icon }: MenuItemProps) => {
  const { pathname, push } = useRouter();
  const isActive = pathname === route;
  return (
    <Box
      className={`${styles.menuItem} ${
        isActive ? styles.active : styles.inactive
      }`}
      onClick={() => route && push(route)}
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
  const menu = {
    dashboard: [
      {
        label: 'My Regions',
        route: '/',
        icon: <DashboardIcon />,
      },
    ],
    market: [
      {
        label: 'Sell Region',
        route: '/market/sell',
        icon: <ArrowCircleRightIcon />,
      },
      {
        label: 'Buy Region',
        route: '/market/buy',
        icon: <ShoppingCartIcon />,
      },
    ],
  };
  return (
    <div className={styles.container}>
      {Object.entries(menu).map(([label, submenu], index) => (
        <Box
          key={index}
          sx={{
            color: theme.palette.text.secondary,
            textTransform: 'capitalize',
          }}
        >
          {label}
          {submenu.map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}
        </Box>
      ))}
    </div>
  );
};
