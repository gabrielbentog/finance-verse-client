'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  Stack,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth';
import { verifyTwoFactorDuringLogin } from '@/services/authService'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [code, setCode] = useState('')
  const [tempAuthToken, setTempAuthToken] = useState<string | null>(null)

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // O context de autenticação agora já redireciona para o dashboard
      const resp = await login(data.email, data.password);
      // Caso o backend informe que 2FA é necessário, ativa a etapa adicional
      // Normaliza diferentes formatos de resposta e nomes de campo (ex: tempAuthToken / temp_auth_token)
      const maybe = resp as unknown as Record<string, unknown>;
      // normalize body that may be wrapped in data
      const respBody = (maybe && typeof maybe === 'object' && maybe['data'] && typeof maybe['data'] === 'object') ? (maybe['data'] as Record<string, unknown>) : (maybe as Record<string, unknown>);
      const status = typeof respBody?.['status'] === 'string' ? (respBody['status'] as string) : undefined;
      const twoReq = status === '2fa_required' || respBody?.['two_factor_required'] === true || respBody?.['status'] === 'two_factor_required';
      if (twoReq) {
        // DEBUG: log da resposta para inspecionar formato exato (remover após verificação)
        try { console.debug('2FA required response payload:', { maybe, respBody }); } catch {}
        // capture temp token from multiple possible locations / key names
        const temp = (respBody && (respBody['tempAuthToken'] as string))
          || (respBody && (respBody['temp_auth_token'] as string))
          || (respBody && (respBody['tempToken'] as string))
          || (maybe && (maybe['tempAuthToken'] as string))
          || (maybe && (maybe['temp_auth_token'] as string))
          || null;
        setTempAuthToken(temp);
        setTwoFactorRequired(true);
        setIsSubmitting(false);
        return;
      }
      // se não, o AuthContext já cuida do redirecionamento
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      
      if (typeof err === 'object' && err !== null && 'error' in err) {
        setError((err as { error: string }).error);
      } else {
        setError('Credenciais inválidas ou servidor indisponível');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit2fa = async () => {
    if (!tempAuthToken) {
      setError('Token temporário ausente. Refaça o login.');
      return;
    }
    setIsSubmitting(true)
    try {
      await verifyTwoFactorDuringLogin(tempAuthToken, code)
      // sucesso: backend validou e enviou cookie/token, agora podemos redirecionar
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Erro no 2FA', err)
      setError('Código inválido ou expirado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm" sx={{ my: 'auto' }}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
          <Box sx={{ p: { xs: 3, sm: 6 } }}>
            <Box sx={{ mb: 5, textAlign: 'center' }}>
              <Typography
                component="h1"
                sx={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                Finance Verse
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Bem-vindo de volta! Entre com suas credenciais
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Senha"
                type="password"
                autoComplete="current-password"
                disabled={isSubmitting}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              
              {error && (
                <Typography 
                  color="error" 
                  align="center" 
                  sx={{ 
                    mt: 2,
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    py: 1,
                    px: 2,
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #5a6fd6, #6a4494)',
                  },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : 'Entrar'}
              </Button>
              <Button
                component={Link}
                href="/register"
                fullWidth
                variant="text"
                disabled={isSubmitting}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  color: 'text.secondary',
                  '&:hover': {
                    background: 'transparent',
                    color: '#667eea',
                  },
                }}
              >
                Não tem uma conta? <Box component="span" sx={{ color: '#667eea', ml: 0.5 }}>Cadastre-se</Box>
              </Button>

              {/* Dialog para verificação 2FA */}
              <Dialog open={twoFactorRequired} onClose={() => { setTwoFactorRequired(false); setTempAuthToken(null); }} fullWidth maxWidth="xs">
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Verificação em dois fatores</Typography>
                  <Typography variant="body2" color="text.secondary">Informe o código gerado pelo seu app autenticador</Typography>
                  <TextField
                    label="Código 2FA"
                    fullWidth
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isSubmitting}
                    sx={{ mt: 2 }}
                    autoFocus
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => { setTwoFactorRequired(false); setTempAuthToken(null); setCode('') }}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      fullWidth
                      onClick={submit2fa}
                      disabled={isSubmitting || code.length === 0}
                      sx={{ background: 'linear-gradient(90deg, #667eea, #764ba2)', color: 'white' }}
                    >
                      {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Verificar'}
                    </Button>
                  </Stack>
                </Box>
              </Dialog>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
