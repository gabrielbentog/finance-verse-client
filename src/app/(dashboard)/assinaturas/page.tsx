'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  IconButton,
  Alert,
  AlertTitle,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
// Usamos Box com flex para o layout das cards (evita conflitos de tipagem com Grid)
import {
  Subscription,
  SubscriptionAlert,
  SubscriptionAnalytics,
} from '@/types/subscription';
import {
  getSubscriptions,
  getSubscriptionAlerts,
  getSubscriptionAnalytics,
  deleteSubscription,
  createSubscription,
  updateSubscription,
} from '@/services/subscriptionService';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { Add as AddIcon } from '@mui/icons-material';
import WarningIcon from '@mui/icons-material/Warning';

export default function AssinaturasPage() {
  // router não usado aqui
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [alerts, setAlerts] = useState<SubscriptionAlert[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Modais e formulários
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const [form, setForm] = useState<Partial<Subscription>>({
    name: '',
    category: 'Serviço',
    amount: 0,
    isVariableAmount: false,
    paymentMethod: '',
    frequency: 'Mensal',
    billingDay: '',
    status: 'Ativa',
  });

  const initialForm: Partial<Subscription> = {
    name: '',
    category: 'Serviço',
    amount: 0,
    isVariableAmount: false,
    paymentMethod: '',
    frequency: 'Mensal',
    billingDay: '',
    status: 'Ativa',
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        getSubscriptions(),
        getSubscriptionAlerts(),
        getSubscriptionAnalytics(),
      ]);

      const subs = results[0].status === 'fulfilled' ? (results[0] as PromiseFulfilledResult<Subscription[]>).value : [];
      const alertsData = results[1].status === 'fulfilled' ? (results[1] as PromiseFulfilledResult<SubscriptionAlert[]>).value : [];
      const analyticsData = results[2].status === 'fulfilled' ? (results[2] as PromiseFulfilledResult<SubscriptionAnalytics>).value : null;

      setSubscriptions(subs);
      setAlerts(alertsData);
      setAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      console.error(err);
      // Não quebrar a página: manter UI vazia quando a API falhar
      setSubscriptions([]);
      setAlerts([]);
      setAnalytics(null);
      setError('Erro ao carregar dados das assinaturas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Nota: cancelamento via botão direto foi removido; ações disponíveis no menu (editar/excluir)

  const handleDeleteSubscription = async (id: number) => {
    try {
      await deleteSubscription(id);
      await loadData();
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir assinatura');
    }
  };

  const openEditModal = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setForm({ ...sub });
    setIsEditOpen(true);
  };

  const resetForm = () => setForm({ ...initialForm });

  // Map enums from Portuguese (UI) to English (backend)
  const mapEnumsToBackend = (f: Partial<Subscription>) => {
    const categoryMap: Record<string, string> = {
      'Serviço': 'service',
      'Produto': 'product',
      'Assinatura': 'membership',
      'Outro': 'other',
    };

    const frequencyMap: Record<string, string> = {
      'Mensal': 'monthly',
      'Anual': 'yearly',
      'Semanal': 'weekly',
      'Única': 'once',
    };

    const statusMap: Record<string, string> = {
      'Ativa': 'active',
      'Pausada': 'paused',
      'Cancelada': 'cancelled',
    };

    const payload: Record<string, unknown> = {
      name: f.name as string | undefined,
      amount: (typeof f.amount === 'number' ? f.amount : Number(f.amount ?? 0)) as number,
      isVariableAmount: Boolean(f.isVariableAmount),
      paymentMethod: f.paymentMethod as string | undefined,
      category: (categoryMap[f.category as string] ?? f.category) as string | undefined,
      frequency: (frequencyMap[f.frequency as string] ?? f.frequency) as string | undefined,
      status: (statusMap[f.status as string] ?? f.status) as string | undefined,
      billingDay: (f.billingDay === '' || f.billingDay === undefined) ? null : Number(f.billingDay),
    };

    return payload;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = mapEnumsToBackend(form);
      await createSubscription(payload as unknown as Partial<Subscription>);
      setIsCreateOpen(false);
      resetForm();
      await loadData();
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao criar assinatura');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedSubscription) return;
      const payload = mapEnumsToBackend(form);
      await updateSubscription(selectedSubscription.id, payload as unknown as Partial<Subscription>);
      setIsEditOpen(false);
      setSelectedSubscription(null);
      resetForm();
      await loadData();
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar assinatura');
    }
  };

  const getStatusChipColor = (status: Subscription['status']) => {
    switch (status) {
      case 'Ativa':
        return 'success';
      case 'Cancelada':
        return 'error';
      case 'Pausada':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Componente pequeno para o menu de ações (três pontinhos)
  function ActionsMenu({ row }: { row: Subscription }) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
      <>
        <IconButton size="small" onClick={handleOpen}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={() => { handleClose(); openEditModal(row); }}>Editar</MenuItem>
          <MenuItem onClick={() => { handleClose(); handleDeleteSubscription(row.id); }} sx={{ color: 'error.main' }}>Excluir</MenuItem>
        </Menu>
      </>
    );
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Nome',
      minWidth: 160,
      flex: 1,
    },
    {
      field: 'category',
      headerName: 'Categoria',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'Valor',
      width: 150,
      valueFormatter: (params: { value: number | undefined }) => {
        const val = params?.value;
        if (typeof val !== 'number' || Number.isNaN(val)) return '-';
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(val);
      },
      renderCell: (params) => (
        <Box>
          {typeof params.row?.amount === 'number' ? new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(params.row.amount) : '-'}
          {params.row?.isVariableAmount && (
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              (estimado)
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'paymentMethod',
      headerName: 'Forma de Pagamento',
      minWidth: 140,
    },
    {
      field: 'frequency',
      headerName: 'Frequência',
      minWidth: 120,
    },
    {
      field: 'billingDay',
      headerName: 'Próxima cobrança',
      width: 150,
      renderCell: (params) => {
        const row = params.row as Subscription & { nextBillingDate?: string };
        const next = row.nextBillingDate;
        if (next) {
          const d = new Date(next);
          if (!Number.isNaN(d.getTime())) {
            return new Intl.DateTimeFormat('pt-BR').format(d);
          }
        }

        return '-';
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusChipColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 80,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          {/* Mostrar menu de ações */}
          <ActionsMenu row={params.row} />
        </Box>
      ),
    },
  ];

  const isTrendingUp: boolean = !!(analytics && Array.isArray(analytics.monthlyTrend) && analytics.monthlyTrend.length >= 2 &&
    analytics.monthlyTrend[analytics.monthlyTrend.length - 1].total >
    analytics.monthlyTrend[analytics.monthlyTrend.length - 2].total);

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
          Assinaturas
        </Typography>

        <Stack spacing={3}>
          {/* Analytics Cards */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              alignItems: 'stretch',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: { md: '33%' }, flex: '1 1 0' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
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
                <Typography color="text.secondary" gutterBottom>
                  Total Mensal em Assinaturas
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {analytics ? new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(analytics.totalMonthly) : '-'}
                </Typography>
                {analytics && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {isTrendingUp ? (
                      <TrendingUpIcon color="error" />
                    ) : (
                      <TrendingDownIcon color="success" />
                    )}
                    <Typography
                      variant="body2"
                      color={isTrendingUp ? 'error.main' : 'success.main'}
                      sx={{ ml: 0.5 }}
                    >
                      {isTrendingUp ? 'Aumentando' : 'Diminuindo'}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>

            <Box sx={{ width: '100%', maxWidth: { md: '33%' }, flex: '1 1 0' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: '#4CAF50',
                  },
                }}
              >
                <Typography color="text.secondary" gutterBottom>
                  % das Despesas Totais
                </Typography>
                <Box sx={{ mt: 2, mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={analytics?.percentageOfExpenses || 0}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#4CAF50',
                      },
                    }}
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {analytics ? `${analytics.percentageOfExpenses}%` : '-'}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ width: '100%', maxWidth: { md: '33%' }, flex: '1 1 0' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: '#FF9800',
                  },
                }}
              >
                <Typography color="text.secondary" gutterBottom>
                  Assinaturas Ativas
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {analytics?.activeSubscriptionsCount ?? subscriptions.filter(s => s.status === 'Ativa').length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  de {subscriptions.length} total
                </Typography>
              </Paper>
            </Box>
          </Box>
          {/* Top bar: botão criar e alert de erro */}
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsCreateOpen(true)}
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
              Nova Assinatura
            </Button>
          </Paper>

          {/* Error alert */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {/* Alerts */}
          {alerts.length > 0 && (
            <Stack spacing={2}>
              {alerts.map((alert, index) => {
                const subscription = subscriptions.find(s => s.id === alert.subscriptionId);
                if (!subscription) return null;

                return (
                  <Alert
                    key={index}
                    severity={
                      alert.type === 'próxima_cobrança'
                        ? 'info'
                        : alert.type === 'duplicada'
                          ? 'warning'
                          : 'error'
                    }
                    icon={<WarningIcon />}
                    sx={{
                      borderRadius: 3,
                    }}
                  >
                    <AlertTitle>
                      {'Cobrança Próxima'}
                    </AlertTitle>
                    {alert.message}
                  </Alert>
                );
              })}
            </Stack>
          )}

          {/* Subscriptions Table */}
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 'calc(100vh - 300px)',
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              pb: 7,
            }}
          >
            <DataGrid
              rows={subscriptions}
              columns={columns}
              loading={loading}
              disableRowSelectionOnClick
              autoHeight
              density="comfortable"
              rowHeight={52}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
                sorting: {
                  sortModel: [{ field: 'billingDay', sort: 'asc' }],
                },
              }}
              sx={{
                border: 'none',
                px: 1,
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
          {/* Modal Criar */}
          <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle>Criar Assinatura</DialogTitle>
            <form onSubmit={handleCreateSubmit}>
              <DialogContent>
                <Stack spacing={2} sx={{ mt: 1, minWidth: { sm: 420 } }}>
                  <TextField label="Nome" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth />
                  <TextField label="Valor" type="number" value={form.amount ?? ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} fullWidth />
                  <TextField label="Forma de Pagamento" value={form.paymentMethod || ''} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} fullWidth />

                  <TextField
                    select
                    label="Categoria"
                    value={form.category ?? 'Serviço'}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as Subscription['category'] }))}
                    fullWidth
                  >
                    <MenuItem value={'Serviço'}>Serviço</MenuItem>
                    <MenuItem value={'Produto'}>Produto</MenuItem>
                    <MenuItem value={'Assinatura'}>Assinatura</MenuItem>
                    <MenuItem value={'Outro'}>Outro</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Frequência"
                    value={form.frequency ?? 'Mensal'}
                    onChange={e => setForm(f => ({ ...f, frequency: e.target.value as Subscription['frequency'] }))}
                    fullWidth
                  >
                    <MenuItem value={'Mensal'}>Mensal</MenuItem>
                    <MenuItem value={'Anual'}>Anual</MenuItem>
                    <MenuItem value={'Semanal'}>Semanal</MenuItem>
                    <MenuItem value={'Única'}>Única</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Dia de Cobrança"
                    value={form.billingDay ?? ''}
                    onChange={e => setForm(f => ({ ...f, billingDay: e.target.value }))}
                    fullWidth
                    SelectProps={{
                      MenuProps: {
                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                        transformOrigin: { vertical: 'top', horizontal: 'left' },
                        PaperProps: { sx: { maxHeight: 240, width: 'auto' } },
                      }
                    }}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <MenuItem key={d} value={String(d)}>{d}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Status"
                    value={form.status ?? 'Ativa'}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Subscription['status'] }))}
                    fullWidth
                  >
                    <MenuItem value={'Ativa'}>Ativa</MenuItem>
                    <MenuItem value={'Pausada'}>Pausada</MenuItem>
                    <MenuItem value={'Cancelada'}>Cancelada</MenuItem>
                  </TextField>

                  <TextField
                    label="Variável?"
                    value={form.isVariableAmount ? 'Sim' : 'Não'}
                    onClick={() => setForm(f => ({ ...f, isVariableAmount: !f.isVariableAmount }))}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={() => { setIsCreateOpen(false); resetForm(); }} sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.95rem', px: 3, color: 'text.secondary', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>Cancelar</Button>
                <Button variant="contained" type="submit" sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.95rem', px: 3, background: 'linear-gradient(90deg, #667eea, #764ba2)', '&:hover': { background: 'linear-gradient(90deg, #5a6fd6, #6a4494)' } }}>Criar</Button>
              </DialogActions>
            </form>
          </Dialog>

          {/* Modal Editar */}
          <Dialog open={isEditOpen} onClose={() => { setIsEditOpen(false); resetForm(); }} PaperProps={{ sx: { borderRadius: 3 } }}>
            <form onSubmit={handleEditSubmit}>
              <DialogTitle>Editar Assinatura</DialogTitle>
              <DialogContent>
                <Stack spacing={2} sx={{ mt: 1, minWidth: { sm: 420 } }}>
                  <TextField label="Nome" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth />
                  <TextField label="Valor" type="number" value={form.amount ?? ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} fullWidth />
                  <TextField label="Forma de Pagamento" value={form.paymentMethod || ''} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} fullWidth />

                  <TextField
                    select
                    label="Categoria"
                    value={form.category ?? 'Serviço'}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as Subscription['category'] }))}
                    fullWidth
                  >
                    <MenuItem value={'Serviço'}>Serviço</MenuItem>
                    <MenuItem value={'Produto'}>Produto</MenuItem>
                    <MenuItem value={'Assinatura'}>Assinatura</MenuItem>
                    <MenuItem value={'Outro'}>Outro</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Frequência"
                    value={form.frequency ?? 'Mensal'}
                    onChange={e => setForm(f => ({ ...f, frequency: e.target.value as Subscription['frequency'] }))}
                    fullWidth
                  >
                    <MenuItem value={'Mensal'}>Mensal</MenuItem>
                    <MenuItem value={'Anual'}>Anual</MenuItem>
                    <MenuItem value={'Semanal'}>Semanal</MenuItem>
                    <MenuItem value={'Única'}>Única</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Dia de Cobrança"
                    value={form.billingDay ?? ''}
                    onChange={e => setForm(f => ({ ...f, billingDay: e.target.value }))}
                    fullWidth
                    SelectProps={{
                      MenuProps: {
                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                        transformOrigin: { vertical: 'top', horizontal: 'left' },
                        PaperProps: { sx: { maxHeight: 240, width: 'auto' } },
                      }
                    }}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <MenuItem key={d} value={String(d)}>{d}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Status"
                    value={form.status ?? 'Ativa'}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Subscription['status'] }))}
                    fullWidth
                  >
                    <MenuItem value={'Ativa'}>Ativa</MenuItem>
                    <MenuItem value={'Pausada'}>Pausada</MenuItem>
                    <MenuItem value={'Cancelada'}>Cancelada</MenuItem>
                  </TextField>

                  <TextField
                    label="Variável?"
                    value={form.isVariableAmount ? 'Sim' : 'Não'}
                    onClick={() => setForm(f => ({ ...f, isVariableAmount: !f.isVariableAmount }))}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button type="button" onClick={() => { setIsEditOpen(false); setSelectedSubscription(null); resetForm(); }} sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.95rem', px: 3, color: 'text.secondary', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>Cancelar</Button>
                <Button variant="contained" type="submit" sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.95rem', px: 3, background: 'linear-gradient(90deg, #667eea, #764ba2)', '&:hover': { background: 'linear-gradient(90deg, #5a6fd6, #6a4494)' } }}>Salvar</Button>
              </DialogActions>
            </form>
          </Dialog>
        </Stack>
      </Container>
    </Box >
  );
}
