import { LoadingButton } from '@mui/lab';

import styles from './index.module.scss';

interface ProgressButtonProps {
  label: string;
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  width?: string;
  [key: string]: any;
}
export const ProgressButton = ({
  label,
  onClick,
  loading,
  disabled = false,
  width,
  ...props
}: ProgressButtonProps) => {
  return (
    <LoadingButton
      onClick={onClick}
      variant='contained'
      loading={loading}
      className={styles.buttonContainer}
      disabled={disabled}
      sx={{
        width: width ? width : 'inherent',
      }}
      {...props}
    >
      {label}
    </LoadingButton>
  );
};
