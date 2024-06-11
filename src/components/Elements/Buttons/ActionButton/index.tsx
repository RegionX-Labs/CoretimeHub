import { Button } from '@mui/material';

import styles from './index.module.scss';

type ActionButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  [key: string]: any;
};
export const ActionButton = ({
  label,
  onClick,
  disabled,
  ...props
}: ActionButtonProps) => {
  return (
    <Button
      variant='contained'
      onClick={onClick}
      className={styles.buttonContainer}
      disabled={disabled}
      {...props}
    >
      {label}
    </Button>
  );
};
