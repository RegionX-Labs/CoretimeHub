import { Alert, Snackbar } from '@mui/material';
import { createContext, useContext, useState } from 'react';

interface ToastManager {
  toastSuccess: (_msg: string, _duration?: number) => void;
  toastError: (_msg: string, _duration?: number) => void;
}

const defaultToastManager = {
  toastSuccess: () => {
    /* */
  },
  toastError: () => {
    /* */
  },
};

const ToastContext = createContext<ToastManager>(defaultToastManager);

interface Props {
  children: React.ReactNode;
}

type ToastParam = {
  message: string;
  duration: number;
  type: 'success' | 'error' | 'warning';
};

const ToastProvider = ({ children }: Props) => {
  const [toasts, setToasts] = useState<ToastParam[]>([]);

  const addToast = (toast: ToastParam) => {
    setToasts([...toasts, toast]);
  };

  const removeToast = (index: number) => {
    setToasts(toasts.filter((_v, i) => i !== index));
  };

  const toastSuccess = (message: string, duration = 3000) => {
    addToast({
      message,
      duration,
      type: 'success',
    });
  };

  const toastError = (message: string, duration = 3000) => {
    addToast({
      message,
      duration,
      type: 'error',
    });
  };

  return (
    <ToastContext.Provider value={{ toastSuccess, toastError }}>
      {children}
      {toasts.map(({ duration, type, message }, index) => (
        <Snackbar
          key={index}
          open
          autoHideDuration={duration}
          onClose={() => removeToast(index)}
        >
          <Alert
            onClose={() => removeToast(index)}
            severity={type}
            variant='filled'
            sx={{ width: '100%' }}
          >
            {message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

export { ToastProvider, useToast };
