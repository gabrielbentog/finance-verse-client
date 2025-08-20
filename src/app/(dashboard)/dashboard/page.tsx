'use client';

import { Paper, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

// Dados mockados
const mockData = {
  saldo: 5000,
  receitas: 8000,
  despesas: 3000,
  categoriasDespesas: [
    { id: 0, value: 1000, label: 'Alimentação' },
    { id: 1, value: 800, label: 'Transporte' },
    { id: 2, value: 600, label: 'Lazer' },
    { id: 3, value: 600, label: 'Outros' },
  ],
  ultimosLancamentos: [
    { mes: 'Jan', receitas: 7000, despesas: 5000 },
    { mes: 'Fev', receitas: 7500, despesas: 4800 },
    { mes: 'Mar', receitas: 8000, despesas: 3000 },
  ],
};

export default function DashboardPage() {
  return (
    <div className="flex-grow p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPIs */}
        <Paper className="p-4 h-[140px] flex flex-col">
          <Typography color="text.secondary">Saldo Total</Typography>
          <Typography component="p" variant="h4">
            R$ {mockData.saldo.toFixed(2)}
          </Typography>
        </Paper>
        <Paper className="p-4 h-[140px] flex flex-col">
          <Typography color="text.secondary">Total Receitas</Typography>
          <Typography component="p" variant="h4">
            R$ {mockData.receitas.toFixed(2)}
          </Typography>
        </Paper>
        <Paper className="p-4 h-[140px] flex flex-col">
          <Typography color="text.secondary">Total Despesas</Typography>
          <Typography component="p" variant="h4">
            R$ {mockData.despesas.toFixed(2)}
          </Typography>
        </Paper>

        {/* Gráficos */}
        <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Paper className="p-4 h-[400px]">
            <Typography variant="h6" gutterBottom>
              Despesas por Categoria
            </Typography>
            <PieChart
              series={[
                {
                  data: mockData.categoriasDespesas,
                  innerRadius: 30,
                  outerRadius: 100,
                  paddingAngle: 2,
                  cornerRadius: 4,
                },
              ]}
              height={300}
            />
          </Paper>
          <Paper className="p-4 h-[400px]">
            <Typography variant="h6" gutterBottom>
              Últimos 3 Meses
            </Typography>
            <BarChart
              xAxis={[{ scaleType: 'band', data: mockData.ultimosLancamentos.map(d => d.mes) }]}
              series={[
                { data: mockData.ultimosLancamentos.map(d => d.receitas), label: 'Receitas' },
                { data: mockData.ultimosLancamentos.map(d => d.despesas), label: 'Despesas' },
              ]}
              height={300}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
}
