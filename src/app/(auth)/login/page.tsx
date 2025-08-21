'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth';

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

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // O context de autenticação agora já redireciona para o dashboard
      await login(data.email, data.password);
      // Não precisamos mais redirecionar aqui, pois o contexto já faz isso
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
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
