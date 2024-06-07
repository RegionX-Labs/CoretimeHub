import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface DateInputProps {
  label: string;
  value: Date | null;
  onChange: (_v: Date | null) => void;
}

export const DateInput = ({ label, value, onChange }: DateInputProps) => {
  const theme = useTheme();
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label={label}
          value={value}
          onChange={onChange}
          sx={{
            '& .MuiFormLabel-root': {
              color: theme.palette.common.black,
            },
            '& .MuiInputBase-root': {
              background: theme.palette.common.white,
              borderRadius: '2rem',
              width: '12rem',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        />
      </LocalizationProvider>
    </>
  );
};
