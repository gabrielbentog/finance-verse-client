'use client';

import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { ArrowBack, AccountBalanceWallet } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 5,
            borderRadius: 4,
            backgroundColor: 'background.paper',
            boxShadow: (theme) => `0 8px 40px -12px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)'}`,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Elementos decorativos financeiros */}
          <Box 
            sx={{ 
              position: 'absolute', 
              top: -25, 
              right: -25, 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              opacity: 0.2,
            }} 
          />
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: -30, 
              left: -30, 
              width: 120, 
              height: 120, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              opacity: 0.2,
            }} 
          />
          
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              mb: 4,
            }}
          >
            <AccountBalanceWallet
              sx={{
                fontSize: 50,
                color: 'primary.main',
              }}
            />
          </Box>
          
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '3.5rem', sm: '4.5rem' }, 
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontWeight: 600,
              mb: 2,
            }}
          >
            Investimento não encontrado
          </Typography>
          
          <Typography 
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: '85%' }}
          >
            Parece que essa página não está em seu portfólio. Talvez seja hora de diversificar seus investimentos em páginas existentes.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBack />}
              onClick={() => router.back()}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.2,
                fontWeight: 600,
              }}
            >
              Voltar
            </Button>
            
            <Button
              variant="contained"
              component={Link}
              href="/dashboard"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.2,
                fontWeight: 600,
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #5a71d6, #6a439a)',
                },
              }}
            >
              Ir para o Dashboard
            </Button>
          </Box>
        </Paper>
        
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 4, color: 'text.secondary' }}
        >
          Finance Verse © {new Date().getFullYear()}
        </Typography>
      </Container>
    </Box>
  );
}
