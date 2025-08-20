'use client';

import { useState } from 'react';
import {
  Box,
  Stack,
  Paper,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { useFinanceStore } from '@/store/financeStore';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

export default function RelatoriosPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { transactions } = useFinanceStore();

  const filteredTransactions = transactions.filter((t) => {
    if (!startDate || !endDate) return true;
    return t.date >= startDate && t.date <= endDate;
  });

  const despesas = filteredTransactions.filter((t) => t.type === 'despesa');
  const receitas = filteredTransactions.filter((t) => t.type === 'receita');

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
    <Box>
      <Stack spacing={3}>
        {/* Filtros */}
        <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Data Inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data Final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={handleExport}>
            Exportar CSV
          </Button>
        </Paper>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Resumo */}
          <Paper sx={{ p: 2, flex: { md: 1 } }}>
            <Typography variant="h6" gutterBottom>
              Resumo do Período
            </Typography>
            <Typography>
              Receitas: {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalReceitas)}
            </Typography>
            <Typography>
              Despesas: {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalDespesas)}
            </Typography>
            <Typography>
              Saldo: {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalReceitas - totalDespesas)}
            </Typography>
          </Paper>

          {/* Gráfico de Pizza */}
          <Paper sx={{ p: 2, flex: { md: 2 } }}>
            <Typography variant="h6" gutterBottom>
              Despesas por Categoria
            </Typography>
            {pieData.length > 0 ? (
              <PieChart
                series={[
                  {
                    data: pieData,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30 },
                  },
                ]}
                height={300}
              />
            ) : (
              <Typography>Sem dados para exibir</Typography>
            )}
          </Paper>
        </Stack>

        {/* Gráfico de Barras */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Receitas vs Despesas
          </Typography>
          <BarChart
            xAxis={[{ 
              scaleType: 'band', 
              data: ['Período Atual'] 
            }]}
            series={[
              { data: [totalReceitas], label: 'Receitas' },
              { data: [totalDespesas], label: 'Despesas' },
            ]}
            height={300}
          />
        </Paper>
      </Stack>
    </Box>
  );
}
