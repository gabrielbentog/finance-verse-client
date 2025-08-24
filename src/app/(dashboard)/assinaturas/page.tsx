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
    nextBillingDate: '',
    status: 'Ativa',
  });

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
      field: 'nextBillingDate',
      headerName: 'Próxima Cobrança',
      width: 150,
      valueFormatter: (params: { value: string | null | undefined }) => {
        if (!params?.value) return '-';
        return new Date(params.value).toLocaleDateString('pt-BR');
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
                  sortModel: [{ field: 'nextBillingDate', sort: 'asc' }],
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
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1, minWidth: { sm: 420 } }}>
                <TextField label="Nome" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth />
                <TextField label="Valor" type="number" value={form.amount ?? ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} fullWidth />
                <TextField label="Forma de Pagamento" value={form.paymentMethod || ''} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} fullWidth />
                <TextField label="Próxima Cobrança" type="date" value={form.nextBillingDate || ''} onChange={e => setForm(f => ({ ...f, nextBillingDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                try {
                  await createSubscription(form as Partial<Subscription>);
                  setIsCreateOpen(false);
                  setForm({});
                  await loadData();
                } catch (err) {
                  console.error(err);
                  setError('Erro ao criar assinatura');
                }
              }} variant="contained">Criar</Button>
            </DialogActions>
          </Dialog>

          {/* Modal Editar */}
          <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle>Editar Assinatura</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1, minWidth: { sm: 420 } }}>
                <TextField label="Nome" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth />
                <TextField label="Valor" type="number" value={form.amount ?? ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} fullWidth />
                <TextField label="Forma de Pagamento" value={form.paymentMethod || ''} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} fullWidth />
                <TextField label="Próxima Cobrança" type="date" value={form.nextBillingDate || ''} onChange={e => setForm(f => ({ ...f, nextBillingDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                try {
                  if (!selectedSubscription) return;
                  await updateSubscription(selectedSubscription.id, form as Partial<Subscription>);
                  setIsEditOpen(false);
                  setSelectedSubscription(null);
                  setForm({});
                  await loadData();
                } catch (err) {
                  console.error(err);
                  setError('Erro ao atualizar assinatura');
                }
              }} variant="contained">Salvar</Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Container>
    </Box >
  );
}
