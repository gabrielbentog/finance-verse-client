'use client';

import React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Typography,
  Stack,
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
  
  const receitas = transactions.filter(t => t.type === 'INCOME');
  console.log('Receitas filtradas:', receitas);
  const totalReceitas = receitas.reduce((acc, curr) => acc + curr.value, 0);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = (data: TransactionFormData) => {
    // Garantindo que a data está no formato correto
    const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    console.log('Data sendo salva:', formattedDate);
    
    addTransaction({
      ...data,
      date: formattedDate,
      type: 'INCOME',
    });
    setIsDialogOpen(false);
    reset();
  };

  const columns: GridColDef[] = [
    { 
      field: 'date', 
      headerName: 'Data', 
      width: 120,
      renderCell: (params) => {
        const date = params.row?.date;
        if (!date) return '-';
        const [year, month, day] = String(date).split('-');
        return `${day}/${month}/${year}`;
      }
    },
    { 
      field: 'description', 
      headerName: 'Descrição', 
      width: 250,
      flex: 1
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
      type: 'number',
      renderCell: (params) => {
        if (typeof params.value !== 'number') return '-';
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(params.value);
      }
    },
  ];

  return (
    <Box sx={{ bgcolor: '#f5f7fb', height: '100%' }}>
      <Container 
        maxWidth={false} 
        sx={{ 
          py: 3,
          pl: { xs: 2, sm: 2 },
          pr: { xs: 2, sm: 3 },
          height: '100%',
          maxWidth: 'xl',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 4,
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Receitas
        </Typography>

        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
              },
            }}
          >
            <Box>
              <Typography color="text.secondary" fontWeight={500}>
                Total de Receitas
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalReceitas)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsDialogOpen(true)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #5a6fd6, #6a4494)',
                },
              }}
            >
              Nova Receita
            </Button>
          </Paper>

          <Paper 
            elevation={0}
            sx={{ 
              height: 'calc(100vh - 300px)', 
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <DataGrid
              rows={receitas}
              columns={columns}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              autoHeight
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: {
                  sortModel: [{ field: 'date', sort: 'desc' }],
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
              }}
            />
          </Paper>
        </Stack>
      </Container>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
            },
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
          Nova Receita
        </DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={() => setIsDialogOpen(false)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.95rem',
              px: 3,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit(onSubmit)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.95rem',
              px: 3,
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(90deg, #5a6fd6, #6a4494)',
              },
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReceitasPage;
