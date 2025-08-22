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
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useFinanceStore } from '@/store/financeStore';
import { useEffect, useCallback } from 'react';
import { getMovements, createMovement, updateMovement, deleteMovement } from '@/services/movementService';
import { Movement, MovementCreateRequest } from '@/types/movement';
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
  const [receitas, setReceitas] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const totalReceitas = receitas.reduce((acc, curr) => acc + curr.amount, 0);

  const loadReceitas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMovements(
        { movement_type: 'income' },
        { page, per_page: pageSize }
      );
      setReceitas(res.data);
      setTotalPages(res.meta.pagination.totalPages);
      setError(null);
    } catch (error) {
      setError('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadReceitas();
  }, [loadReceitas]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = async (data: TransactionFormData) => {
    const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const movement: MovementCreateRequest = {
      title: data.description,
      description: data.description,
      amount: data.value,
      movement_type: 'income',
      category: data.category,
      date: formattedDate,
    };
    try {
      await createMovement(movement);
      // Recarregar receitas após criar
      await loadReceitas();
      setIsDialogOpen(false);
      reset();
    } catch {
      setError('Erro ao criar receita');
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
    {
      field: 'actions',
      headerName: 'Ações',
      width: 100,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenMenu(e, params.row);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<Movement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: errorsEdit }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      value: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    }
  });

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, item: Movement) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  useEffect(() => {
    if (selectedItem && isEditDialogOpen) {
      resetEdit(); // Limpa o form antes de preenchê-lo
      setEditValue('value', selectedItem.amount);
      setEditValue('category', selectedItem.category);
      setEditValue('description', selectedItem.title);
      setEditValue('date', selectedItem.date);
    }
  }, [selectedItem, isEditDialogOpen, setEditValue, resetEdit]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
    setAnchorEl(null); // Só fecha o menu, sem limpar o selectedItem
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
    setAnchorEl(null); // Só fecha o menu, sem limpar o selectedItem
  };

  const handleConfirmDelete = async () => {
    if (selectedItem) {
      try {
        await deleteMovement(selectedItem.id);
        await loadReceitas();
        setError(null);
      } catch (error) {
        setError('Erro ao excluir receita');
      }
    }
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleEditSubmit = async (data: TransactionFormData) => {
    if (!selectedItem) return;

    const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const movement: MovementCreateRequest = {
      title: data.description,
      description: data.description,
      amount: data.value,
      movement_type: 'income',
      category: data.category,
      date: formattedDate,
    };

    try {
      await updateMovement(selectedItem.id, movement);
      await loadReceitas();
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      resetEdit();
      setError(null);
    } catch {
      setError('Erro ao editar receita');
    }
  };

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
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 300px)',
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <DataGrid
              rows={receitas}
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
                px: 2,
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
                '& .MuiDataGrid-virtualScroller': {
                  marginTop: '46px !important',
                },
                '& .MuiDataGrid-columnHeadersInner': {
                  marginLeft: '1px',
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            minWidth: 120,
          }
        }}
      >
        <MenuItem onClick={handleEdit}>Editar</MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          Excluir
        </MenuItem>
      </Menu>

      {/* Modal de Edição */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          resetEdit();
        }}
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
        <form onSubmit={handleSubmitEdit(handleEditSubmit)}>
          <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Editar Receita
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
                {...registerEdit('value', { valueAsNumber: true })}
                error={!!errorsEdit?.value}
                helperText={errorsEdit?.value?.message}
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
                {...registerEdit('category')}
                error={!!errorsEdit?.category}
                helperText={errorsEdit?.category?.message}
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
                {...registerEdit('description')}
                error={!!errorsEdit?.description}
                helperText={errorsEdit?.description?.message}
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
                {...registerEdit('date')}
                error={!!errorsEdit?.date}
                helperText={errorsEdit?.date?.message}
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
              type="button"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetEdit();
              }}
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
              type="submit"
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
        </form>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
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
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
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
            onClick={handleConfirmDelete}
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
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReceitasPage;
