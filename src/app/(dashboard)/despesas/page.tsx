'use client';

import React, { useEffect, useCallback, useState } from 'react';
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
  Checkbox,
  FormControlLabel,
  Stack,
  Paper,
  Typography,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ImportExportButtons } from '@/components/movements/ImportExportButtons';
// Hook de debounce personalizado
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
import { getMovements, createMovement, updateMovement, deleteMovement } from '@/services/movementService';
import { Movement, MovementCreateRequest } from '@/types/movement';

// Movement may have optional IRPF fields from the API
type MaybeMovement = Movement & { is_business?: boolean; activity_kind?: number };
import { Add as AddIcon } from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const transactionSchema = z.object({
  value: z.number().min(0.01, 'O valor deve ser maior que zero'),
  category: z.string().min(1, 'A categoria é obrigatória'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  date: z.string(),
  is_business: z.boolean().optional(),
  // activity_kind can come as string from select; accept number or string and coerce later
  activity_kind: z.union([z.number(), z.string()]).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function DespesasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [despesas, setDespesas] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [totalDespesas, setTotalDespesas] = useState(0);
  const debouncedSearchTerm = useDebounce(searchTerm, 800); // 800ms de delay

  const loadDespesas = useCallback(async () => {
    setLoading(true);
    try {
      const filters: { movement_type: 'expense' | 'income', q?: Record<string, string> } = {
        movement_type: 'expense',
        q: {
          ...(debouncedSearchTerm ? { description_cont: debouncedSearchTerm } : {}),
          ...(selectedYear ? { date_year_eq: selectedYear } : {}),
          ...(selectedMonth ? { date_month_eq: selectedMonth } : {})
        }
      };

      const res = await getMovements(
        filters,
        { page, per_page: pageSize }
      );
      setDespesas(res.data);
      setTotalPages(res.meta.pagination.totalPages);
      setTotalDespesas(res.meta.totalAmount);
      setError(null);
    } catch {
      setError('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearchTerm, selectedYear, selectedMonth]);

  useEffect(() => {
    loadDespesas();
  }, [loadDespesas]);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  // watch para exibir campo activity_kind somente quando is_business estiver marcado
  const isBusinessCreate = useWatch({ control, name: 'is_business' });

  const onSubmit = async (data: TransactionFormData) => {
    const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const movement: MovementCreateRequest = {
      title: data.description,
      description: data.description,
      amount: data.value,
      movement_type: 'expense',
      category: data.category,
      date: formattedDate,
      // only allowed for expenses as per API
      ...(data.is_business !== undefined ? { is_business: data.is_business } : {}),
      ...(data.activity_kind !== undefined ? { activity_kind: data.activity_kind } : {}),
    };
    try {
      await createMovement(movement);
      // Recarregar despesas após criar
      await loadDespesas();
      setIsDialogOpen(false);
      reset();
    } catch {
      // keep error state minimal
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
  const [selectedItem, setSelectedItem] = useState<MaybeMovement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, item: Movement) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    control: controlEdit,
    formState: { errors: errorsEdit }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      value: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      is_business: false,
      activity_kind: undefined,
    }
  });

  // watch para edição
  const isBusinessEdit = useWatch({ control: controlEdit, name: 'is_business' });

  useEffect(() => {
    if (selectedItem && isEditDialogOpen) {
      resetEdit(); // Limpa o form antes de preenchê-lo
      // preencher campos com várias possíveis chaves (snake_case / camelCase)
      const rec = selectedItem as unknown as Record<string, unknown>;
      const amt = (rec['amount'] ?? rec['value'] ?? 0) as number;
      const cat = String(rec['category'] ?? rec['categoria'] ?? '');
      const desc = String(rec['title'] ?? rec['description'] ?? '');
      const dt = String(rec['date'] ?? rec['createdAt'] ?? '');
      const isBiz = Boolean(rec['is_business'] ?? rec['isBusiness'] ?? false);
      const rawAct = rec['activity_kind'] ?? rec['activityKind'] ?? rec['activityKindText'] ?? rec['activity_kind_text'] ?? rec['activity_kind_text'] ?? '';

      // map textual activity kinds (pt/en) to numeric codes expected by the select
      const mapActivityKind = (raw: unknown): TransactionFormData['activity_kind'] => {
        if (raw === undefined || raw === null || raw === '') return '';
        if (typeof raw === 'number') return raw;
        if (typeof raw === 'string') {
          const s = raw.trim();
          if (/^\d+$/.test(s)) return Number(s);
          const lower = s.toLocaleLowerCase('pt-BR');
          // Portuguese matches
          if (lower.includes('comércio') || lower.includes('comercio') || lower.includes('comerc')) return 0;
          if (lower.includes('transporte') || lower.includes('transport')) return 1;
          if (lower.includes('serviços') || lower.includes('servicos') || lower.includes('servic')) return 2;
          // English matches
          if (lower.includes('commerce') || lower.includes('trade')) return 0;
          if (lower.includes('transport')) return 1;
          if (lower.includes('service') || lower.includes('services')) return 2;
        }
        return '';
      };

      const actKind = mapActivityKind(rawAct);

      setEditValue('value', amt);
      setEditValue('category', cat);
      setEditValue('description', desc);
      setEditValue('date', dt);
      setEditValue('is_business', isBiz);
      setEditValue('activity_kind', (actKind as unknown) as TransactionFormData['activity_kind'] ?? '');
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
        await loadDespesas();
        setError(null);
      } catch {
        setError('Erro ao excluir despesa');
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
      movement_type: 'expense',
      category: data.category,
      date: formattedDate,
      ...(data.is_business !== undefined ? { is_business: data.is_business } : {}),
      ...(data.activity_kind !== undefined ? { activity_kind: data.activity_kind } : {}),
    };

    try {
      await updateMovement(selectedItem.id, movement);
      await loadDespesas();
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      resetEdit();
      setError(null);
    } catch {
      setError('Erro ao editar despesa');
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
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <ImportExportButtons
                onImportSuccess={() => {
                  loadDespesas();
                }}
                onError={(message: string) => setError(message)}
              />
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
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 3,
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Pesquisar por descrição"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset para primeira página ao pesquisar
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    loadDespesas();
                  }
                }}
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
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setPage(1);
                }}
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
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  );
                })}
              </TextField>
              <TextField
                select
                label="Mês"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setPage(1);
                }}
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
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  return (
                    <MenuItem key={month} value={month.toString()}>
                      {new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 'calc(100vh - 300px)',
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              pb: 7 // Adicionando padding bottom para evitar sobreposição com o footer
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
              <Controller
                name="is_business"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={Boolean(field.value)} />}
                    label="Relacionado ao meu negócio (IRPF - MEI)"
                  />
                )}
              />
              <Controller
                name="activity_kind"
                control={control}
                render={({ field }) => (
                  // mostrar apenas se marcado como relacionado ao negócio
                  isBusinessCreate ? (
                    <TextField
                      select
                      label="Tipo de Atividade (MEI)"
                      {...field}
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="">Nenhum</MenuItem>
                      <MenuItem value={0}>Comércio</MenuItem>
                      <MenuItem value={1}>Transporte</MenuItem>
                      <MenuItem value={2}>Serviços</MenuItem>
                    </TextField>
                  ) : (<></>)
                )}
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
              Editar Despesa
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
                <Controller
                  name="is_business"
                  control={controlEdit}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={Boolean(field.value)} />}
                      label="Relacionado ao meu negócio (IRPF - MEI)"
                    />
                  )}
                />
                <Controller
                  name="activity_kind"
                  control={controlEdit}
                  render={({ field }) => (
                    isBusinessEdit ? (
                      <TextField
                        select
                        label="Tipo de Atividade (MEI)"
                        {...field}
                        sx={{ minWidth: 200 }}
                      >
                        <MenuItem value="">Nenhum</MenuItem>
                        <MenuItem value={0}>Comércio</MenuItem>
                        <MenuItem value={1}>Transporte</MenuItem>
                        <MenuItem value={2}>Serviços</MenuItem>
                      </TextField>
                    ) : (<></>)
                  )}
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
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
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
      </Container>
    </Box>
  );
}