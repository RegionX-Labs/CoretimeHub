import { SnackbarProvider, useSnackbar } from 'notistack';
import { createContext, useContext } from 'react';

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

  const toastSuccess = (message: string, duration = 3000) => {
    enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: duration,
    });
  };

  const toastError = (message: string, duration = 3000) => {
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: duration,
    });
  };

  const toastInfo = (message: string, duration = 3000) => {
    enqueueSnackbar(message, {
      variant: 'info',
      autoHideDuration: duration,
    });
  };

  const toastWarning = (message: string, duration = 3000) => {
    enqueueSnackbar(message, {
      variant: 'warning',
      autoHideDuration: duration,
    });
  };

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
