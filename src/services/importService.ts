import { movementApi } from './movementService';

interface ImportResponse {
  message: string;
  movements: Array<{
    id: number;
    title: string;
    description: string;
    amount: number;
    movement_type: 'expense' | 'income';
    category: string;
    date: string;
  }>;
}

interface ImportError {
  errors: Array<{
    row: number;
    errors: string[];
  }>;
}

export async function importMovements(file: File): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await movementApi.post('/movements/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export function downloadTemplateFile() {
  const headers = ['Data', 'Valor', 'Descrição', 'Categoria', 'Tipo'];
  const csvContent = headers.join(',') + '\n';

  // Criar um blob com o conteúdo CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Criar URL para download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'template_movimentacoes.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
