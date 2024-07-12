import { Button } from '@mui/material';
import { ButtonProps } from '@mui/material/Button';

import styles from './index.module.scss';

type ActionButtonProps = ButtonProps & {
  label: string;
  onClick: () => void;
  [key: string]: any;
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
