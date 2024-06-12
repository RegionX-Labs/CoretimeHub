import { Button } from '@mui/material';

import styles from './index.module.scss';

type ActionButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  [key: string]: any;
  fullWidth?: boolean;
};
export const ActionButton = ({
  label,
  onClick,
  disabled,
  fullWidth = false,
  ...props
}: ActionButtonProps) => {
  return (
    <Button
      variant='contained'
      onClick={onClick}
      className={styles.buttonContainer}
      disabled={disabled}
      fullWidth={fullWidth}
      {...props}
    >
      {label}
    </Button>
  );
};
