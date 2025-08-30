"use client"
import React from "react"
import Image from "next/image"
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Card,
  CardContent,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth"

import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import SecurityIcon from "@mui/icons-material/Security"
import AnalyticsIcon from "@mui/icons-material/Analytics"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const handleAccess = () => {
    if (isLoading) return
    if (user) router.push("/dashboard")
    else router.push("/login")
  }

  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh" }}>
      {/* HERO SECTION */}
      <Box
        sx={{
          minHeight: { xs: "auto", md: "90vh" },
          pt: { xs: 8, md: 16 },
          pb: { xs: 8, md: 16 },
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative",
        }}
      >
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 8, md: 12 }} alignItems="center">
            <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: "50%" } }}>
              <Typography
                variant="h1"
                sx={{ fontWeight: 300, lineHeight: 1.2, mb: 4, fontSize: { xs: "2.5rem", md: "3.5rem" }, color: "white" }}
              >
                Finanças Pessoais
                <Typography component="span" sx={{ display: "block", fontWeight: 600, fontSize: { xs: "2rem", md: "2.8rem" }, mt: 1 }}>
                  Inteligentes
                </Typography>
              </Typography>

              <Typography variant="h5" sx={{ mb: 6, fontWeight: 400, lineHeight: 1.6, color: "rgba(255,255,255,0.9)", maxWidth: 500 }}>
                Organize suas finanças com inteligência artificial. Análises precisas, previsões confiáveis e insights personalizados.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mb: 6 }}>
                <Button variant="contained" size="large" onClick={handleAccess} sx={{ borderRadius: 2, textTransform: "none", py: 1.5, px: 4, fontSize: "1rem", fontWeight: 500, bgcolor: "white", color: "#667eea", '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
                  Começar agora
                </Button>
                <Button variant="outlined" size="large" sx={{ borderRadius: 2, textTransform: "none", py: 1.5, px: 4, fontSize: "1rem", fontWeight: 500, borderColor: "rgba(255,255,255,0.5)", color: "white", '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Ver demonstração
                </Button>
              </Stack>

              <Stack direction="row" spacing={4} sx={{ color: "rgba(255,255,255,0.8)" }}>
                <Typography variant="body2">Gratuito para começar</Typography>
                <Typography variant="body2">Configuração em minutos</Typography>
                <Typography variant="body2">Dados seguros</Typography>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Paper
                elevation={8}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  maxWidth: 1100,
                  width: "100%",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
              >
                <Image
                  src="/home.png"
                  alt="Dashboard FinanceVerse"
                  width={1100}
                  height={700}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </Paper>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* ESTATÍSTICAS */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          <Box sx={{ textAlign: 'center', flex: '1 1 0' }}>
            <Typography variant="h3" sx={{ fontWeight: 600, color: "#667eea", mb: 1 }}>50K+</Typography>
            <Typography variant="body1" color="text.secondary">Usuários ativos</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: '1 1 0' }}>
            <Typography variant="h3" sx={{ fontWeight: 600, color: "#667eea", mb: 1 }}>94%</Typography>
            <Typography variant="body1" color="text.secondary">Precisão nas previsões</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: '1 1 0' }}>
            <Typography variant="h3" sx={{ fontWeight: 600, color: "#667eea", mb: 1 }}>R$ 847</Typography>
            <Typography variant="body1" color="text.secondary">Economia média mensal</Typography>
          </Box>
        </Stack>
      </Container>

      {/* RECURSOS PRINCIPAIS */}
      <Box sx={{ py: 8, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontWeight: 300, textAlign: "center", mb: 2, fontSize: { xs: "2rem", md: "2.5rem" }, color: "#1a1a1a" }}>Como funciona</Typography>
          <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 8, fontWeight: 400, maxWidth: 600, mx: "auto" }}>Tecnologia avançada para simplificar sua vida financeira</Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={6}>
            <Box sx={{ flex: '1 1 0' }}>
              <Card elevation={0} sx={{ height: "100%", border: "1px solid #f0f0f0", borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, bgcolor: '#f3f4f6', mb: 3 }}>
                    <AnalyticsIcon sx={{ fontSize: 30, color: '#667eea' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>Análise Automática</Typography>
                  <Typography color="text.secondary">Cadastre seus gastos e nossa IA analisa automaticamente seus padrões de gastos.</Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 0' }}>
              <Card elevation={0} sx={{ height: "100%", border: "1px solid #f0f0f0", borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, bgcolor: '#f3f4f6', mb: 3 }}>
                    <TrendingUpIcon sx={{ fontSize: 30, color: '#667eea' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>Previsões Inteligentes</Typography>
                  <Typography color="text.secondary">Algoritmos avançados preveem seu saldo futuro com alta precisão.</Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 0' }}>
              <Card elevation={0} sx={{ height: "100%", border: "1px solid #f0f0f0", borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, bgcolor: '#f3f4f6', mb: 3 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 30, color: '#667eea' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>Insights Personalizados</Typography>
                  <Typography color="text.secondary">Receba recomendações específicas para seu perfil financeiro.</Typography>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* TECNOLOGIA IA */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={8} alignItems="center">
          <Box sx={{ flex: '1 1 0' }}>
            <Typography variant="h2" sx={{ fontWeight: 300, mb: 3, fontSize: { xs: '2rem', md: '2.5rem' } }}>Inteligência Artificial Avançada</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>Nossa IA utiliza machine learning para aprender seus hábitos financeiros.</Typography>
            <List sx={{ mb: 4 }}>
              <ListItem disableGutters sx={{ py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}><CheckCircleIcon sx={{ color: '#667eea', fontSize: 20 }} /></ListItemIcon>
                <ListItemText primary="Detecção automática de gastos desnecessários" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItem>
              <ListItem disableGutters sx={{ py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}><CheckCircleIcon sx={{ color: '#667eea', fontSize: 20 }} /></ListItemIcon>
                <ListItemText primary="Previsões de saldo com alta precisão" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItem>
            </List>
          </Box>
          <Box sx={{ flex: '1 1 0' }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', border: '1px solid #e2e8f0' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <SmartToyIcon sx={{ fontSize: 32, color: '#667eea' }} />
                <Typography variant="h6" fontWeight={500}>IA em Ação</Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Exemplo de análise automática realizada pela nossa IA:</Typography>
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#4a5568', lineHeight: 1.5 }}>
                  • Padrão de gastos excessivos em delivery: R$ 340/mês
                  <br />• Oportunidade de investimento: R$ 500 disponíveis
                  <br />• Previsão saldo março: R$ 2.847 (confiança: 94%)
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Container>

      {/* DEPOIMENTOS */}
      <Box sx={{ py: 8, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontWeight: 300, mb: 8, textAlign: 'center', fontSize: { xs: '2rem', md: '2.5rem' } }}>O que dizem nossos usuários</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            {/*
              Cards alinhados e com altura igual usando display: flex e minHeight.
              O Stack já está em row no desktop, então basta garantir que os Boxes/cards ocupem a mesma altura.
            */}
            <Box sx={{ flex: '1 1 0', display: 'flex' }}>
              <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: { xs: 0, md: 240 } }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48 }}>R</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Rafaela Santos</Typography>
                    <Typography variant="body2" color="text.secondary">Empreendedora</Typography>
                  </Box>
                </Stack>
                <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
                  A análise automática identificou <strong>R$ 347</strong> em assinaturas que eu havia esquecido. Em uma semana já estava economizando esse valor mensalmente.
                </Typography>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 0', display: 'flex' }}>
              <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: { xs: 0, md: 240 } }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48 }}>M</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Marcos Silva</Typography>
                    <Typography variant="body2" color="text.secondary">Designer</Typography>
                  </Box>
                </Stack>
                <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
                  As previsões de saldo me ajudaram a evitar o vermelho em março. O alerta chegou com 2 semanas de antecedência, tempo suficiente para me organizar.
                </Typography>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 0', display: 'flex' }}>
              <Card elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: { xs: 0, md: 240 } }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48 }}>L</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Letícia Costa</Typography>
                    <Typography variant="body2" color="text.secondary">Médica</Typography>
                  </Box>
                </Stack>
                <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
                  Finalmente tenho clareza sobre minhas finanças. Os relatórios automáticos me poupam horas de organização manual e são muito mais precisos.
                </Typography>
              </Card>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* SEGURANÇA */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={8} alignItems="center">
          <Box sx={{ flex: '1 1 0' }}>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <SecurityIcon sx={{ fontSize: 48, mb: 3 }} />
              <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>Segurança de Nível Bancário</Typography>
              <Typography sx={{ mb: 3, opacity: 0.9 }}>Seus dados são protegidos com criptografia AES-256 e certificação ISO 27001.</Typography>
              <Stack spacing={2}>
                <Chip label="Criptografia AES-256" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Certificação ISO 27001" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Auditoria de segurança contínua" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </Paper>
          </Box>

          <Box sx={{ flex: '1 1 0' }}>
            <Typography variant="h2" sx={{ fontWeight: 300, mb: 3 }}>Seus dados, nossa prioridade</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>Utilizamos os mais altos padrões de segurança da indústria financeira.</Typography>
            <Typography color="text.secondary">Nossos servidores são hospedados em data centers certificados, com monitoramento 24/7 e backups automáticos.</Typography>
          </Box>
        </Stack>
      </Container>

      {/* FAQ */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontWeight: 300, mb: 8, textAlign: 'center' }}>Perguntas frequentes</Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flex: '1 1 0' }}>
              <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={500}>Como a IA analisa minhas finanças?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">Nossa IA utiliza algoritmos de machine learning para analisar padrões em suas transações.</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={500}>Meus dados bancários estão seguros?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">Sim. Utilizamos criptografia de nível bancário (AES-256) e nunca armazenamos senhas.</Typography>
                </AccordionDetails>
              </Accordion>
            </Box>

            <Box sx={{ flex: '1 1 0' }}>
              <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={500}>Qual a precisão das previsões?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">Nossas previsões de saldo têm precisão média de 94% para períodos de até 3 meses.</Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={500}>Posso cancelar a qualquer momento?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">Sim, você pode cancelar sua conta a qualquer momento e exportar seus dados.</Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* CTA FINAL */}
      <Box sx={{ py: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 8, bgcolor: '#f8fafc' }}>
            <Container maxWidth="lg">
              <Typography variant="h2" sx={{ fontWeight: 300, mb: 8, textAlign: 'center' }}>Comece hoje mesmo</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                <Box sx={{ flex: '1 1 0' }}>
                  <Typography variant="h5" sx={{ mb: 2 }}>Experimente a inteligência financeira que entende você.</Typography>
                </Box>
                <Box>
                  <Button variant="contained" color="primary" size="large" onClick={handleAccess} sx={{ textTransform: 'none', borderRadius: 2 }}>Acessar</Button>
                </Box>
              </Stack>
            </Container>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

