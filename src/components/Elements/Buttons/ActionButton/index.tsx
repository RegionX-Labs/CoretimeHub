import { Button } from '@mui/material';

import styles from './index.module.scss';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}
export const ActionButton = ({
  label,
  onClick,
  disabled,
}: ActionButtonProps) => {
  return (
    <Button
      variant='contained'
      onClick={onClick}
      className={styles.buttonContainer}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};
