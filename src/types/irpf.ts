export interface IrpfKpis {
  receitaBruta: number;
  despesas: number;
  lucroReal: number;
  irpfEstimado: number;
}

export interface IrpfDetail {
  receitaBruta: number;
  despesasComprovadas: number;
  lucroReal: number;
  parcelaIsentaPercent: number;
  parcelaIsentaValor: number;
  lucroTributavel: number;
  faixa: string;
  parcelaADeduzir: number;
  irpfDevido: number;
}

export interface IrpfSummaryResponse {
  kpis: IrpfKpis;
  detail: IrpfDetail;
}

export interface IrpfExpenseItem {
  id: string | number;
  date: string;
  category: string;
  value: number;
  nf: boolean;
  doc?: string | null;
}

export interface IrpfRevenueItem {
  id: string | number;
  date: string;
  client: string;
  value: number;
  note?: string;
}

export interface ReportExportResponse {
  data: {
    download_url?: string;
    job_id?: string;
  };
}
