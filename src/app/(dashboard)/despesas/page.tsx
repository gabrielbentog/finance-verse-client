'use client';

import React from 'react';
// ...existing code...
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Paper,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useFinanceStore } from '@/store/financeStore';
import { useEffect, useCallback, useState } from 'react';
import { getMovements, createMovement } from '@/services/movementService';
import { Movement, MovementCreateRequest, MovementListResponse } from '@/types/movement';
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
  const [despesas, setDespesas] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const totalDespesas = despesas.reduce((acc, curr) => acc + curr.amount, 0);

  const loadDespesas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMovements(
        { movement_type: 'expense' },
        { page, per_page: pageSize }
      );
      setDespesas(res.data);
      setTotalPages(res.meta.pagination.totalPages);
      setError(null);
    } catch (error) {
      setError('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadDespesas();
  }, [loadDespesas]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = async (data: TransactionFormData) => {
    const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const movement: MovementCreateRequest = {
      title: data.description,
      description: data.description,
      amount: data.value,
      movement_type: 'expense',
      category: data.category,
      date: formattedDate,
    };
    try {
      await createMovement(movement);
      // Recarregar despesas após criar
      await loadDespesas();
      setIsDialogOpen(false);
      reset();
    } catch {
      setError('Erro ao criar despesa');
    }
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
      field: 'title',
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
      field: 'amount',
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
          Despesas
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
                Total de Despesas
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(totalDespesas)}
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
              Nova Despesa
            </Button>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 300px)',
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <DataGrid
              rows={despesas}
              columns={columns}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              autoHeight
              loading={loading}
              paginationMode="server"
              rowCount={totalPages * pageSize}
              pageSizeOptions={[5, 10, 25]}
              paginationModel={{ page: page - 1, pageSize }}
              onPaginationModelChange={(model) => {
                setPage(model.page + 1);
                setPageSize(model.pageSize);
              }}
              initialState={{
                sorting: {
                  sortModel: [{ field: 'date', sort: 'desc' }],
                },
              }}
              sx={{
                border: 'none',
                flex: 1,
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
                '& .MuiDataGrid-footerContainer': {
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                },
              }}
            />
          </Paper>
        </Stack>

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
            Nova Despesa
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
      </Container>
    </Box>
  );
}
