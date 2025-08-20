'use client';

import { useState } from 'react';
import {
  Box,
  Stack,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
} from '@mui/material';
import { useFinanceStore } from '@/store/financeStore';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function RelatoriosPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { transactions } = useFinanceStore();

  const filteredTransactions = transactions.filter((t) => {
    if (!startDate || !endDate) return true;
    return t.date >= startDate && t.date <= endDate;
  });

  const despesas = filteredTransactions.filter((t) => t.type === 'EXPENSE');
  const receitas = filteredTransactions.filter((t) => t.type === 'INCOME');

  const totalDespesas = despesas.reduce((acc, curr) => acc + curr.value, 0);
  const totalReceitas = receitas.reduce((acc, curr) => acc + curr.value, 0);

  const despesasPorCategoria = despesas.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.value;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(despesasPorCategoria).map(([category, value], id) => ({
    id,
    value,
    label: category,
  }));

  const handleExport = () => {
    const csvContent = [
      ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor'],
      ...filteredTransactions.map(t => [
        t.date,
        t.type,
        t.category,
        t.description,
        t.value.toString(),
      ]),
    ].map(row => row.join(',')).join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_financeiro.csv';
    link.click();
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
          Relatórios
        </Typography>

        <Stack spacing={3}>
          {/* Filtros */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2, 
              alignItems: { xs: 'flex-start', sm: 'center' },
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 0 } }}>
              <AssessmentIcon sx={{ color: '#667eea' }} />
              <Typography fontWeight={500} color="text.secondary">
                Filtrar período
              </Typography>
            </Box>
            
            <TextField
              label="Data Inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
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
              label="Data Final"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  },
                }
              }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Button 
              variant="contained" 
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
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
              Exportar CSV
            </Button>
          </Paper>

          {/* Resumo do Período */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
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
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Resumo do Período
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={3} 
              divider={<Box 
                component="div" 
                sx={{ 
                  display: { xs: 'none', md: 'block' }, 
                  height: 'auto', 
                  width: '1px', 
                  bgcolor: 'divider' 
                }} 
              />}
            >
              <Box sx={{ flex: 1 }}>
                <Typography color="text.secondary" fontWeight={500}>
                  Receitas
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, mt: 1, color: '#4CAF50' }}>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(totalReceitas)}
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography color="text.secondary" fontWeight={500}>
                  Despesas
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, mt: 1, color: '#f44336' }}>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(totalDespesas)}
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography color="text.secondary" fontWeight={500}>
                  Saldo
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, mt: 1, color: totalReceitas - totalDespesas >= 0 ? '#4CAF50' : '#f44336' }}>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(totalReceitas - totalDespesas)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Gráficos */}
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3}
            sx={{ height: { md: '450px' } }}
          >
            {/* Gráfico de Pizza */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                height: { xs: '400px', md: '100%' },
                display: 'flex',
                flexDirection: 'column',
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Despesas por Categoria
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pieData.length > 0 ? (
                  <PieChart
                    series={[
                      {
                        data: pieData,
                        innerRadius: 30,
                        outerRadius: 100,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        highlightScope: { fade: 'global', highlight: 'item' },
                      },
                    ]}
                    height={300}
                    width={400}
                    margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    sx={{ width: '100%', maxHeight: '100%' }}
                  />
                ) : (
                  <Typography color="text.secondary">Sem dados para exibir</Typography>
                )}
              </Box>
            </Paper>

            {/* Gráfico de Barras */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                height: { xs: '400px', md: '100%' },
                display: 'flex',
                flexDirection: 'column',
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Receitas vs Despesas
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart
                  xAxis={[{ 
                    scaleType: 'band', 
                    data: ['Período Atual'] 
                  }]}
                  series={[
                    { data: [totalReceitas], label: 'Receitas', color: '#4CAF50' },
                    { data: [totalDespesas], label: 'Despesas', color: '#f44336' },
                  ]}
                  height={300}
                  width={350}
                  margin={{ top: 10, bottom: 10, left: 40, right: 10 }}
                  sx={{ width: '100%', maxHeight: '100%' }}
                />
              </Box>
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
