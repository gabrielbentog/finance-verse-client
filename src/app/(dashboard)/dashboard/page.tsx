'use client';

import { useState } from 'react';
import { Box, Paper, Typography, Container, CircularProgress } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState('');

  const { data, loading, error } = useDashboardData({ year, month });

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
          Visão Geral
        </Typography>

        <DashboardFilters
          year={year}
          month={month}
          onYearChange={setYear}
          onMonthChange={setMonth}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'error.light',
              color: 'error.contrastText',
            }}
          >
            <Typography>{error}</Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {/* KPIs */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWalletIcon sx={{ color: '#667eea' }} />
                  <Typography color="text.secondary" fontWeight={500}>
                    Saldo Total
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(data.saldo)}
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  position: 'relative',
                  overflow: 'hidden',
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#4CAF50' }} />
                  <Typography color="text.secondary" fontWeight={500}>
                    Total Receitas
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(data.receitas)}
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: '#f44336',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDownIcon sx={{ color: '#f44336' }} />
                  <Typography color="text.secondary" fontWeight={500}>
                    Total Despesas
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(data.despesas)}
                </Typography>
              </Paper>

              {/* Gráficos */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  gridColumn: { xs: '1', md: 'span 3' },
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 3,
                    }}
                  >
                    Despesas por Categoria
                  </Typography>
                  {data.categoriasDespesas.length > 0 ? (
                    <PieChart
                      series={[
                        {
                          data: data.categoriasDespesas,
                          innerRadius: 30,
                          outerRadius: 100,
                          paddingAngle: 2,
                          cornerRadius: 4,
                          highlightScope: { fade: 'global', highlight: 'item' },
                        },
                      ]}
                      height={300}
                      margin={{ top: 20, bottom: 20 }}
                    />
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
                      Nenhuma despesa registrada no período
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 3,
                    }}
                  >
                    Últimos 3 Meses
                  </Typography>
                  {data.ultimosLancamentos.length > 0 ? (
                    <BarChart
                      xAxis={[{
                        scaleType: 'band',
                        data: data.ultimosLancamentos.map(d => d.mes),
                      }]}
                      series={[
                        {
                          data: data.ultimosLancamentos.map(d => d.receitas),
                          label: 'Receitas',
                          color: '#4CAF50',
                        },
                        {
                          data: data.ultimosLancamentos.map(d => d.despesas),
                          label: 'Despesas',
                          color: '#f44336',
                        },
                      ]}
                      height={300}
                      sx={{
                        '.MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': {
                          transform: 'none',
                        },
                      }}
                    />
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
                      Nenhuma movimentação registrada no período
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
