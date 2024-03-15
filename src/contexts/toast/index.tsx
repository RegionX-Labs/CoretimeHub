import { SnackbarProvider, useSnackbar } from 'notistack';
import { createContext, useCallback, useContext } from 'react';

interface ToastManager {
  toastSuccess: (_msg: string, _duration?: number) => void;
  toastError: (_msg: string, _duration?: number) => void;
  toastInfo: (_msg: string, _duration?: number) => void;
  toastWarning: (_msg: string, _duration?: number) => void;
}

const defaultToastManager = {
  toastSuccess: () => {
    /* */
  },
  toastError: () => {
    /* */
  },
  toastInfo: () => {
    /* */
  },
  toastWarning: () => {
    /* */
  },
};

const ToastContext = createContext<ToastManager>(defaultToastManager);

interface Props {
  children: React.ReactNode;
}

const ToastProviderWrapper = ({ children }: Props) => {
  const { enqueueSnackbar } = useSnackbar();

  const toastSuccess = useCallback(
    (message: string, duration = 3000) => {
      enqueueSnackbar(message, {
        variant: 'success',
        autoHideDuration: duration,
      });
    },
    [enqueueSnackbar]
  );

  const toastError = useCallback(
    (message: string, duration = 3000) => {
      enqueueSnackbar(message, {
        variant: 'error',
        autoHideDuration: duration,
      });
    },
    [enqueueSnackbar]
  );

  const toastInfo = useCallback(
    (message: string, duration = 3000) => {
      enqueueSnackbar(message, {
        variant: 'info',
        autoHideDuration: duration,
      });
    },
    [enqueueSnackbar]
  );

  const toastWarning = useCallback(
    (message: string, duration = 3000) => {
      enqueueSnackbar(message, {
        variant: 'warning',
        autoHideDuration: duration,
      });
    },
    [enqueueSnackbar]
  );

  return (
    <ToastContext.Provider
      value={{ toastSuccess, toastError, toastInfo, toastWarning }}
    >
      {children}
    </ToastContext.Provider>
  );
};

const ToastProvider = ({ children }: Props) => (
  <SnackbarProvider autoHideDuration={3000}>
    <ToastProviderWrapper>{children}</ToastProviderWrapper>
  </SnackbarProvider>
);

const useToast = () => useContext(ToastContext);

export { ToastProvider, useToast };
