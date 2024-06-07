import { Button } from '@mui/material';

import styles from './index.module.scss';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}
export const ActionButton = ({
  label,
  onClick,
  disabled,
  fullWidth = false,
}: ActionButtonProps) => {
  return (
    <Button
      variant='contained'
      onClick={onClick}
      className={styles.buttonContainer}
      disabled={disabled}
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  );
};
