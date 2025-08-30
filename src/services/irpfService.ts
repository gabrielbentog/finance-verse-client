import { movementApi } from './movementService';
import { IrpfSummaryResponse, IrpfExpenseItem, IrpfRevenueItem, ReportExportResponse } from '@/types/irpf';

// type-guard for wrapper { data: unknown }
function hasDataWrapper(v: unknown): v is { data: unknown } {
  return Boolean(v && typeof v === 'object' && 'data' in (v as Record<string, unknown>));
}

function getNumberField(obj: Record<string, unknown> | undefined, ...keys: string[]) {
  if (!obj) return 0;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    if (k in rec) return Number(rec[k] ?? 0);
  }
  return 0;
}

function getStringField(obj: Record<string, unknown> | undefined, ...keys: string[]) {
  if (!obj) return '';
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    if (k in rec) return String(rec[k] ?? '');
  }
  return '';
}

export async function getIrpfSummary(year?: string): Promise<IrpfSummaryResponse> {
  const params = year ? { year } : {};
  const response = await movementApi.get('/irpf', { params });
  const raw = response.data as unknown;
  const payload = hasDataWrapper(raw) ? (raw.data as Record<string, unknown>) : (raw as Record<string, unknown>);

  const k = (payload['kpis'] as Record<string, unknown> | undefined) ?? (payload as Record<string, unknown>);
  const d = (payload['detail'] as Record<string, unknown> | undefined) ?? (payload as Record<string, unknown>);

  const kpis: IrpfSummaryResponse['kpis'] = {
    receitaBruta: getNumberField(k, 'receitaBruta', 'grossRevenue', 'gross_revenue', 'gross_revenue_amount'),
    despesas: getNumberField(k, 'despesas', 'expenses', 'totalExpenses'),
    lucroReal: getNumberField(k, 'lucroReal', 'profit', 'realProfit'),
    irpfEstimado: getNumberField(k, 'irpfEstimado', 'estimatedIrpf', 'estimated_irpf'),
  };

  const detail: IrpfSummaryResponse['detail'] = {
    receitaBruta: getNumberField(d, 'receitaBruta', 'grossRevenue'),
    despesasComprovadas: getNumberField(d, 'despesasComprovadas', 'provedExpenses', 'proved_expenses'),
    lucroReal: getNumberField(d, 'lucroReal', 'realProfit'),
    parcelaIsentaPercent: getNumberField(d, 'parcelaIsentaPercent', 'parcelaIsentaPercent'),
    parcelaIsentaValor: getNumberField(d, 'parcelaIsentaValor', 'parcelaIsentaValue', 'parcela_isenta_value'),
    lucroTributavel: getNumberField(d, 'lucroTributavel', 'taxableProfit', 'taxable_profit'),
    faixa: getStringField(d, 'faixa', 'taxBracket', 'faixa'),
    parcelaADeduzir: getNumberField(d, 'parcelaADeduzir', 'parcelaADeduzir', 'deductiblePortion'),
    irpfDevido: getNumberField(d, 'irpfDevido', 'irpfDevido', 'irpfDue'),
  };

  return { kpis, detail };
}

export async function getIrpfExpenses(year?: string, nf: 'with' | 'without' | 'all' = 'all', page = 1, per_page = 20) {
  const params: Record<string, string | number> = {
    ...(year ? { year } : {}),
    nf: nf,
    'page[number]': page,
    'page[size]': per_page,
  };
  const response = await movementApi.get('/irpf/expenses', { params });
  const raw = response.data as unknown;
  const payload = hasDataWrapper(raw) ? (raw.data as Record<string, unknown>) : (raw as Record<string, unknown>);

  // payload may be { data: [...], meta } or an array directly
  const list: unknown[] = Array.isArray(payload) ? (payload as unknown[]) : ((payload['data'] as unknown[]) ?? []);

  const mapped: IrpfExpenseItem[] = list.map(item => {
    const it = item as Record<string, unknown>;
    return {
      id: String(it['id'] ?? ''),
      date: String(it['date'] ?? ''),
      category: String(it['category'] ?? it['activityKindText'] ?? ''),
      value: Number(it['amount'] ?? it['value'] ?? it['taxableAmount'] ?? 0),
      nf: Boolean(it['isBusiness'] ?? it['nf'] ?? false),
      doc: it['supportingDocUrl'] ? String(it['supportingDocUrl']) : (it['doc'] ? String(it['doc']) : null),
    };
  });

  return { data: mapped, meta: (Array.isArray(payload) ? undefined : (payload['meta'] as Record<string, unknown> | undefined)) };
}

export async function getIrpfRevenues(year?: string, page = 1, per_page = 20) {
  const params: Record<string, string | number> = {
    ...(year ? { year } : {}),
    'page[number]': page,
    'page[size]': per_page,
  };
  const response = await movementApi.get('/irpf/revenues', { params });
  const raw = response.data as unknown;
  const payload = hasDataWrapper(raw) ? (raw.data as Record<string, unknown>) : (raw as Record<string, unknown>);
  const list: unknown[] = Array.isArray(payload) ? (payload as unknown[]) : ((payload['data'] as unknown[]) ?? []);

  const mapped: IrpfRevenueItem[] = list.map(item => {
    const it = item as Record<string, unknown>;
    return {
      id: String(it['id'] ?? ''),
      date: String(it['date'] ?? ''),
      client: String(it['client'] ?? it['title'] ?? it['counterpartyName'] ?? ''),
      value: Number(it['amount'] ?? it['value'] ?? 0),
      note: it['note'] ? String(it['note']) : undefined,
    };
  });

  return { data: mapped, meta: (Array.isArray(payload) ? undefined : (payload['meta'] as Record<string, unknown> | undefined)) };
}

export async function getReportIrpf(year?: string) {
  const params = year ? { year } : {};
  const response = await movementApi.get('/reports/irpf', { params });
  return response.data;
}

export async function exportReportIrpf(body: { year: number | string; format?: 'pdf' | 'xlsx' | 'csv' }) {
  const response = await movementApi.post('/reports/irpf/export', body);
  return response.data as ReportExportResponse;
}
