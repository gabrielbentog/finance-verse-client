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
  Tooltip,
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
  updateSubscriptionStatus,
} from '@/services/subscriptionService';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { BarChart } from '@mui/x-charts/BarChart';
import WarningIcon from '@mui/icons-material/Warning';

export default function AssinaturasPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [alerts, setAlerts] = useState<SubscriptionAlert[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleCancelSubscription = async (id: number) => {
    try {
      await updateSubscriptionStatus(id, 'cancelada');
      await loadData(); // Recarrega os dados
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao cancelar assinatura');
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

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Nome',
      width: 200,
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
      width: 180,
    },
    {
      field: 'frequency',
      headerName: 'Frequência',
      width: 120,
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
      width: 120,
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
      width: 100,
      renderCell: (params) => (
        params.row.status === 'ativa' && (
          <Tooltip title="Cancelar assinatura">
            <IconButton
              size="small"
              onClick={() => handleCancelSubscription(params.row.id)}
              sx={{ color: 'error.main' }}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        )
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

          {/* Chart */}
          {analytics && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Evolução das Assinaturas
              </Typography>
              <Box sx={{ height: 300 }}>
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: analytics.monthlyTrend.map(d => d.month),
                  }]}
                  series={[
                    {
                      data: analytics.monthlyTrend.map(d => d.total),
                      color: '#667eea',
                    },
                  ]}
                  height={300}
                />
              </Box>
            </Paper>
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
              }}
            />
          </Paper>
        </Stack>
      </Container>
    </Box >
  );
}
