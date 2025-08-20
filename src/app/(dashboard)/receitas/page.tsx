'use client';

import React from 'react';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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

const ReceitasPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { transactions, addTransaction } = useFinanceStore();
  
  const receitas = transactions.filter(t => t.type === 'receita');
  const totalReceitas = receitas.reduce((acc, curr) => acc + curr.value, 0);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = (data: TransactionFormData) => {
    addTransaction({
      ...data,
      type: 'receita',
    });
    setIsDialogOpen(false);
    reset();
  };

  const columns: GridColDef[] = [
    { 
      field: 'date', 
      headerName: 'Data', 
      width: 120,
      valueFormatter: ({ value }) => new Date(value).toLocaleDateString('pt-BR'),
    },
    { 
      field: 'description', 
      headerName: 'Descrição', 
      width: 250 
    },
    { 
      field: 'category', 
      headerName: 'Categoria', 
      width: 150 
    },
    {
      field: 'value',
      headerName: 'Valor',
      width: 150,
      valueFormatter: ({ value }) => value ? `R$ ${Number(value).toFixed(2)}` : '-',
    },
  ];

  return (
    <div className="flex-grow p-6">
      <div className="grid gap-4">
        <Paper className="p-4 flex justify-between items-center">
          <Typography variant="h6">
            Total de Receitas: R$ {totalReceitas.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Nova Receita
          </Button>
        </Paper>
        <Paper className="h-[500px]">
          <DataGrid
            rows={receitas}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25]}
          />
        </Paper>
      </div>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Nova Receita</DialogTitle>
        <DialogContent>
          <div className="mt-4 space-y-4">
            <TextField
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
              required
              fullWidth
              label="Categoria"
              {...register('category')}
              error={!!errors.category}
              helperText={errors.category?.message}
            />
            <TextField
              required
              fullWidth
              label="Descrição"
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
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
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ReceitasPage;
