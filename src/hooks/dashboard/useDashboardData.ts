import { useState, useEffect, useCallback } from 'react';
import { getDashboardData } from '@/services/dashboardService';

// Tipos internos da aplicação (mantendo a consistência com o que já está sendo usado)
interface DashboardData {
  saldo: number;
  receitas: number;
  despesas: number;
  categoriasDespesas: Array<{
    id: string;
    value: number;
    label: string;
  }>;
  ultimosLancamentos: Array<{
    mes: string;
    receitas: number;
    despesas: number;
  }>;
}

interface DashboardFilters {
  year: string;
  month: string;
}

export function useDashboardData(filters: DashboardFilters) {
  const [data, setData] = useState<DashboardData>({
    saldo: 0,
    receitas: 0,
    despesas: 0,
    categoriasDespesas: [],
    ultimosLancamentos: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const apiData = await getDashboardData(filters);

      // Convertendo os dados da API para o formato interno da aplicação
      setData({
        saldo: apiData.data.balance,
        receitas: apiData.data.income,
        despesas: apiData.data.expenses,
        categoriasDespesas: apiData.data.expensesByCategory,
        ultimosLancamentos: apiData.data.lastMonths.map(month => ({
          mes: month.month.split('/')[0], // Pegando apenas o nome do mês
          receitas: month.income,
          despesas: month.expenses,
        })),
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [filters.year, filters.month]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData // Adicionando a função de refetch para casos onde precisamos recarregar os dados manualmente
  };
}
