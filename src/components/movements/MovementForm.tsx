import { Stack, TextField } from '@mui/material';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { TransactionFormData } from '@/types/movement';

interface MovementFormProps {
  register: UseFormRegister<TransactionFormData>;
  errors: FieldErrors<TransactionFormData>;
}

export const MovementForm = ({ register, errors }: MovementFormProps) => {
  return (
    <Stack spacing={3} sx={{ mt: 2, minWidth: { sm: '400px' } }}>
      <TextField
        required
        fullWidth
        label="Valor"
        type="number"
        inputProps={{
          step: '0.01',
          min: '0',
        }}
        {...register('value', { valueAsNumber: true })}
        error={!!errors.value}
        helperText={errors.value?.message}
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
        required
        fullWidth
        label="Categoria"
        {...register('category')}
        error={!!errors.category}
        helperText={errors.category?.message}
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
        required
        fullWidth
        label="Descrição"
        {...register('description')}
        error={!!errors.description}
        helperText={errors.description?.message}
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
        required
        fullWidth
        type="date"
        label="Data"
        InputLabelProps={{ shrink: true }}
        {...register('date')}
        error={!!errors.date}
        helperText={errors.date?.message}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#667eea',
            },
          }
        }}
      />
    </Stack>
  );
};
