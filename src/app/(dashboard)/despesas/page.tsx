'use client';

import React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Paper,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useFinanceStore } from '@/store/financeStore';
import { Add as AddIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const transactionSchema = z.object({
  value: z.number().min(0.01, 'O valor deve ser maior que zero'),
  category: z.string().min(1, 'A categoria é obrigatória'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  date: z.string(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function DespesasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { transactions, addTransaction } = useFinanceStore();
  
  const despesas = transactions.filter(t => t.type === 'EXPENSE');
  const totalDespesas = despesas.reduce((acc, curr) => acc + curr.value, 0);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = (data: TransactionFormData) => {
    addTransaction({
      ...data,
      type: 'EXPENSE',
    });
    setIsDialogOpen(false);
    reset();
  };

  const columns = [
    { field: 'date', headerName: 'Data', width: 120 },
    { field: 'description', headerName: 'Descrição', width: 250 },
    { field: 'category', headerName: 'Categoria', width: 150 },
    {
      field: 'value',
      headerName: 'Valor',
      width: 150,
      valueFormatter: (params: { value: number | null | undefined }) => {
        if (typeof params.value === 'number') {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(Math.abs(params.value));
        }
        return '';
      },
    },
  ];

  return (
    <Box>
      <Stack spacing={3}>
        <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Total de Despesas: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalDespesas)}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Nova Despesa
          </Button>
        </Paper>
        <Paper sx={{ height: 400 }}>
          <DataGrid
            rows={despesas}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
          />
        </Paper>
      </Stack>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Nova Despesa</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Valor"
              type="number"
              inputProps={{ step: '0.01' }}
              {...register('value', { valueAsNumber: true })}
              error={!!errors.value}
              helperText={errors.value?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Categoria"
              {...register('category')}
              error={!!errors.category}
              helperText={errors.category?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Descrição"
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type="date"
              {...register('date')}
              error={!!errors.date}
              helperText={errors.date?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit(onSubmit)}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
