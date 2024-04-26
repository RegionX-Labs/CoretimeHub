import { LoadingButton } from '@mui/lab';

import styles from './index.module.scss';

interface ProgressButtonProps {
  label: string;
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}
export const ProgressButton = ({
  label,
  onClick,
  loading,
  disabled = false,
}: ProgressButtonProps) => {
  return (
    <LoadingButton
      onClick={onClick}
      variant='contained'
      loading={loading}
      className={styles.buttonContainer}
      disabled={disabled}
    >
      {label}
    </LoadingButton>
  );
};
