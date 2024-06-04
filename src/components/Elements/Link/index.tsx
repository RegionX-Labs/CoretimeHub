import { Button } from '@mui/material';
import React from 'react';

interface LinkProps {
  href: string;
  target?: string;
  children: React.ReactNode;
}

export const Link = ({ href, target = '_blank', children }: LinkProps) => {
  const onClick = () => {
    if (!href) return;
    window.open(href, target);
  };

  return <Button onClick={onClick}>{children}</Button>;
};
