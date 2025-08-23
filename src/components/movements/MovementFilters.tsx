import { Stack, TextField, MenuItem } from '@mui/material';

interface MovementFiltersProps {
  searchTerm: string;
  selectedYear: string;
  selectedMonth: string;
  onSearchChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
}

export const MovementFilters = ({
  searchTerm,
  selectedYear,
  selectedMonth,
  onSearchChange,
  onYearChange,
  onMonthChange,
}: MovementFiltersProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { value: '', label: 'Todos' },
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        fullWidth
        label="Pesquisar por descrição"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#667eea',
            },
          }
        }}
      />
      <TextField
        select
        label="Ano"
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        sx={{
          minWidth: 120,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#667eea',
            },
          }
        }}
      >
        <MenuItem value="">Todos</MenuItem>
        {years.map((year) => (
          <MenuItem key={year} value={year.toString()}>
            {year}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Mês"
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        sx={{
          minWidth: 120,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#667eea',
            },
          }
        }}
      >
        {months.map((month) => (
          <MenuItem key={month.value} value={month.value}>
            {month.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
};
