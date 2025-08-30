import { Stack, TextField, MenuItem } from '@mui/material';
import { UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form';
import { TransactionFormData } from '@/types/movement';

interface MovementFormProps {
  register: UseFormRegister<TransactionFormData>;
  errors: FieldErrors<TransactionFormData>;
  control?: Control<TransactionFormData>;
}

export const MovementForm = ({ register, errors, control }: MovementFormProps) => {
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
      {control ? (
        <Controller
          name="category"
          control={control}
          defaultValue={''}
          render={({ field, fieldState }) => (
            <TextField
              required
              select
              fullWidth
              label="Categoria"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error || !!errors.category}
              helperText={fieldState.error?.message ?? errors.category?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  },
                }
              }}
            >
              <MenuItem value="">Selecione</MenuItem>
              <MenuItem value="food">Alimentação</MenuItem>
              <MenuItem value="transport">Transporte</MenuItem>
              <MenuItem value="internet">Internet</MenuItem>
              <MenuItem value="lodging">Hospedagem</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="rent">Aluguel</MenuItem>
              <MenuItem value="supplies">Materiais</MenuItem>
              <MenuItem value="education">Educação</MenuItem>
              <MenuItem value="health">Saúde</MenuItem>
              <MenuItem value="personal">Pessoal</MenuItem>
              <MenuItem value="other">Outro</MenuItem>
            </TextField>
          )}
        />
      ) : (
        <TextField
          required
          select
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
        >
          <MenuItem value="">Selecione</MenuItem>
          <MenuItem value="food">Alimentação</MenuItem>
          <MenuItem value="transport">Transporte</MenuItem>
          <MenuItem value="internet">Internet</MenuItem>
          <MenuItem value="lodging">Hospedagem</MenuItem>
          <MenuItem value="marketing">Marketing</MenuItem>
          <MenuItem value="rent">Aluguel</MenuItem>
          <MenuItem value="supplies">Materiais</MenuItem>
          <MenuItem value="education">Educação</MenuItem>
          <MenuItem value="health">Saúde</MenuItem>
          <MenuItem value="personal">Pessoal</MenuItem>
          <MenuItem value="other">Outro</MenuItem>
        </TextField>
      )}
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
