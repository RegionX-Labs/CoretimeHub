import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';

interface DateInputProps extends DatePickerProps<Date> {
  label?: string;
}

export const DateInput = ({ label = '', ...props }: DateInputProps) => {
  const theme = useTheme();
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label={label}
          sx={{
            '.MuiFormLabel-root': {
              color: theme.palette.common.black,
            },
            '.MuiInputBase-root': {
              background: theme.palette.common.white,
              borderRadius: '0.5rem',
            },
            '.MuiOutlinedInput-input': {
              height: '1em',
              py: '1rem',
            },
          }}
          {...props}
        />
      </LocalizationProvider>
    </>
  );
};
