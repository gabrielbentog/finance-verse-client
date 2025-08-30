'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  MenuItem,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tooltip,
  Link as MUILink,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import {
  getIrpfSummary,
  getIrpfExpenses,
  getIrpfRevenues,
  exportReportIrpf,
  getReportIrpf,
} from '@/services/irpfService';
import { IrpfExpenseItem, IrpfRevenueItem, IrpfKpis, IrpfDetail } from '@/types/irpf';

// ---------- Utils ----------
// Safe formatter: accepts number | undefined and coerces to 0 when invalid
const fmtCurrency = (n?: number) => {
  const num = Number(n ?? 0);
  // if still NaN, fall back to 0
  const safe = Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe);
};

// inicialização vazia — os dados virão da API

type FiltroNF = 'todas' | 'comNF' | 'semNF';

export default function IprfPage() {
  const [year, setYear] = useState('2025');
  const [filtroNF, setFiltroNF] = useState<FiltroNF>('todas');

  // data states (inicializados vazios — serão populados pela API)
  const [kpis, setKpis] = useState<IrpfKpis>({
    receitaBruta: 0,
    despesas: 0,
    lucroReal: 0,
    irpfEstimado: 0,
  });
  const [detail, setDetail] = useState<IrpfDetail>({
    receitaBruta: 0,
    despesasComprovadas: 0,
    lucroReal: 0,
    parcelaIsentaPercent: 0,
    parcelaIsentaValor: 0,
    lucroTributavel: 0,
    faixa: '',
    parcelaADeduzir: 0,
    irpfDevido: 0,
  });
  const [despesasEmpresariais, setDespesasEmpresariais] = useState<IrpfExpenseItem[]>([]);
  const [receitas, setReceitas] = useState<IrpfRevenueItem[]>([]);

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [loadingRevenues, setLoadingRevenues] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const despesasFiltradas = useMemo(() => {
    if (filtroNF === 'comNF') return despesasEmpresariais.filter(d => d.nf);
    if (filtroNF === 'semNF') return despesasEmpresariais.filter(d => !d.nf);
    return despesasEmpresariais;
  }, [filtroNF, despesasEmpresariais]);

  const totalDespesasFiltradas = useMemo(
    () => despesasFiltradas.reduce((acc, d) => acc + d.value, 0),
    [despesasFiltradas]
  );

  // Handlers (placeholders – integrar com backend/exports)
  const handleGerarRelatorio = () => {
    // chamar endpoint /reports/irpf?year=... e abrir JSON em nova aba (preview)
    (async () => {
      try {
        setError(null);
        const data = await getReportIrpf(year);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (err) {
        console.error(err);
        setError('Falha ao gerar relatório.');
      }
    })();
  };
  const handleExportar = () => {
    (async () => {
      try {
        setError(null);
        const res = await exportReportIrpf({ year: Number(year), format: 'pdf' });
        const downloadUrl = res?.data?.download_url;
        if (downloadUrl) {
          window.open(downloadUrl, '_blank');
        } else if (res?.data?.job_id) {
          setError('Relatório enfileirado. Aguarde notificação.');
        } else {
          setError('Exportação iniciada, mas sem URL de download retornada.');
        }
      } catch (err) {
        console.error(err);
        setError('Falha ao exportar relatório.');
      }
    })();
  };

  // fetch summary on year change
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingSummary(true);
      try {
        setError(null);
        const summary = await getIrpfSummary(year);
        if (!mounted) return;
        // service now returns a normalized, typed object; use it directly
        setKpis(summary.kpis);
        setDetail(summary.detail);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar resumo IRPF — exibindo dados mock.');
      } finally {
        if (mounted) setLoadingSummary(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [year]);

  // fetch expenses & revenues when year or filtro changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingExpenses(true);
      try {
        setError(null);
        const nfParam = filtroNF === 'todas' ? 'all' : filtroNF === 'comNF' ? 'with' : 'without';
        const resp = await getIrpfExpenses(year, nfParam, 1, 50);
        if (!mounted) return;
        if (resp?.data) setDespesasEmpresariais(resp.data as IrpfExpenseItem[]);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar despesas — exibindo dados mock.');
      } finally {
        if (mounted) setLoadingExpenses(false);
      }
    })();

    (async () => {
      setLoadingRevenues(true);
      try {
        const resp = await getIrpfRevenues(year, 1, 50);
        if (!mounted) return;
        if (resp?.data) setReceitas(resp.data as IrpfRevenueItem[]);
      } catch (err) {
        console.error(err);
        setError(prev => prev ? prev : 'Falha ao carregar receitas — exibindo dados mock.');
      } finally {
        if (mounted) setLoadingRevenues(false);
      }
    })();

    return () => { mounted = false; };
  }, [year, filtroNF]);

  return (
    <Box sx={{ bgcolor: '#f5f7fb', minHeight: '100vh', py: 4 }}>
      <Container
        maxWidth={false}
        sx={{ py: 3, pl: { xs: 2, sm: 2 }, pr: { xs: 2, sm: 3 }, maxWidth: 'xl' }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            mb: 3,
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Declaração IRPF – MEI
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
                Acompanhe como sua movimentação como MEI impacta no Imposto de Renda. Os valores
                consideram apenas receitas e despesas marcadas como empresariais.
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                select
                label="Ano-base"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
                aria-label="Selecionar ano-base"
              >
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2026">2026</MenuItem>
              </TextField>

              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleGerarRelatorio}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  '&:hover': { background: 'linear-gradient(90deg, #5a6fd6, #6a4494)' },
                }}
                disabled={loadingSummary || loadingExpenses || loadingRevenues}
              >
                Gerar Relatório
              </Button>

              <Button
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleExportar}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                }}
                disabled={loadingSummary || loadingExpenses || loadingRevenues}
              >
                Exportar PDF/Excel
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {error && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error.main">{error}</Typography>
          </Box>
        )}

        {/* KPIs */}
        <Box
          sx={{
            mb: 3,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: { xs: 2, md: 3 }, // usar spacing do tema em vez de 16 px fixo
          }}
        >
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Receita Bruta MEI
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {fmtCurrency(kpis.receitaBruta)}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Despesas MEI
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {fmtCurrency(kpis.despesas)}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Lucro Real
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {fmtCurrency(kpis.lucroReal)}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              IRPF Estimado
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {fmtCurrency(kpis.irpfEstimado)}
            </Typography>
          </Paper>
        </Box>

        {/* Detalhamento */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Detalhamento
          </Typography>

          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
          >
            <Stack spacing={1}>
              <Typography>
                Receita Bruta: <strong>{fmtCurrency(detail.receitaBruta)}</strong>
              </Typography>
              <Typography>
                Despesas comprovadas: <strong>{fmtCurrency(detail.despesasComprovadas)}</strong>
              </Typography>
              <Typography>
                Lucro real: <strong>{fmtCurrency(detail.lucroReal)}</strong>
              </Typography>
              <Typography>
                Parcela isenta ({detail.parcelaIsentaPercent}%):{' '}
                <strong>{fmtCurrency(detail.parcelaIsentaValor)}</strong>
              </Typography>
              <Typography>
                Lucro tributável: <strong>{fmtCurrency(detail.lucroTributavel)}</strong>
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Faixa da tabela IRPF:</Typography>
                <Typography sx={{ fontWeight: 700 }}>{detail.faixa}</Typography>
                <Tooltip
                  title="Percentual e dedução aplicados conforme tabela progressiva anual da Receita."
                  placement="top"
                >
                  <InfoOutlinedIcon fontSize="small" sx={{ ml: 1 }} />
                </Tooltip>
              </Box>

              <Typography>
                Parcela a deduzir: <strong>{fmtCurrency(detail.parcelaADeduzir)}</strong>
              </Typography>
              <Typography>
                IRPF devido: <strong>{fmtCurrency(detail.irpfDevido)}</strong>
              </Typography>
            </Stack>
          </Box>
        </Paper>

        {/* Tabela de Despesas Empresariais */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Despesas Empresariais
            </Typography>
            <Stack direction="row" spacing={1} role="tablist" aria-label="Filtro de NF">
              <Chip
                label="Todas"
                variant={filtroNF === 'todas' ? 'filled' : 'outlined'}
                color={filtroNF === 'todas' ? 'primary' : 'default'}
                onClick={() => setFiltroNF('todas')}
              />
              <Chip
                label="Com NF"
                variant={filtroNF === 'comNF' ? 'filled' : 'outlined'}
                color={filtroNF === 'comNF' ? 'primary' : 'default'}
                onClick={() => setFiltroNF('comNF')}
              />
              <Chip
                label="Sem NF"
                variant={filtroNF === 'semNF' ? 'filled' : 'outlined'}
                color={filtroNF === 'semNF' ? 'primary' : 'default'}
                onClick={() => setFiltroNF('semNF')}
              />
            </Stack>
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" aria-label="Tabela de despesas empresariais">
              <caption>
                Total filtrado: <strong>{fmtCurrency(totalDespesasFiltradas)}</strong>
              </caption>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>NF no CNPJ?</TableCell>
                  <TableCell>Comprovante</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {despesasFiltradas.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.date}</TableCell>
                    <TableCell>{d.category}</TableCell>
                    <TableCell align="right">{fmtCurrency(d.value)}</TableCell>
                    <TableCell>{d.nf ? '✅' : '❌'}</TableCell>
                    <TableCell>
                      {d.doc ? (
                        <MUILink
                          href="#"
                          underline="hover"
                          onClick={(e) => e.preventDefault()}
                          aria-label={`Abrir comprovante ${d.doc}`}
                        >
                          ver PDF
                        </MUILink>
                      ) : (
                        <Button size="small" variant="outlined" aria-label="Fazer upload do comprovante">
                          upload
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>

        {/* Tabela de Receitas MEI */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Receitas MEI
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" aria-label="Tabela de receitas MEI">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>Observações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receitas.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.client}</TableCell>
                    <TableCell align="right">{fmtCurrency(r.value)}</TableCell>
                    <TableCell>{r.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>

        {/* Insights e Alertas */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Insights e Alertas
          </Typography>
          <Stack spacing={1}>
            <Typography>
              💡 Você poderia reduzir seu IRPF ao aumentar despesas documentadas com NF no CNPJ.
            </Typography>
            <Typography>
              ⚠️ Você está próximo do limite anual do MEI (R$ 81.000). Atualmente já faturou{' '}
              <strong>{fmtCurrency(kpis.receitaBruta)}</strong>.
            </Typography>
            <Typography>
              ✅ Despesa com faculdade está sendo considerada por estar ligada à atividade (Ciência
              da Computação).
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
