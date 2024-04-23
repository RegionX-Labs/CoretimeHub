import { LoadingButton } from '@mui/lab';

import styles from './index.module.scss';

interface ProgressButtonProps {
  label: string;
  onClick: () => void;
  loading: boolean;
}
export const ProgressButton = ({
  label,
  onClick,
  loading,
}: ProgressButtonProps) => {
  return (
    <LoadingButton
      onClick={onClick}
      variant='contained'
      loading={loading}
      className={styles.buttonContainer}
    >
      {label}
    </LoadingButton>
  );
};
