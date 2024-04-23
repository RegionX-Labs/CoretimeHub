import { Button } from '@mui/material';

import styles from './index.module.scss';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
}
export const ActionButton = ({ label, onClick }: ActionButtonProps) => {
  return (
    <Button
      variant='contained'
      onClick={onClick}
      className={styles.buttonContainer}
    >
      {label}
    </Button>
  );
};
