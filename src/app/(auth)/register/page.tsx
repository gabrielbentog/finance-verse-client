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

const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // O context de autenticação agora já redireciona para o dashboard
      await registerUser(data.name, data.email, data.password);
      // Não precisamos mais redirecionar aqui, pois o contexto já faz isso
    } catch (err) {
      console.error('Erro ao criar conta:', err);
      
      if (typeof err === 'object' && err !== null && 'error' in err) {
        setError((err as { error: string }).error);
      } else {
        setError('Erro ao criar conta. Tente novamente mais tarde.');
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
                Crie sua conta e comece a gerenciar suas finanças
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Nome"
                autoFocus
                disabled={isSubmitting}
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
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
                label="Email"
                autoComplete="email"
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
              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirmar Senha"
                type="password"
                disabled={isSubmitting}
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
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
                ) : 'Cadastrar'}
              </Button>

              <Button
                component={Link}
                href="/login"
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
                Já tem uma conta? <Box component="span" sx={{ color: '#667eea', ml: 0.5 }}>Faça login</Box>
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
