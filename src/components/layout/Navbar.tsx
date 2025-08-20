'use client';

import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
import { DarkMode, LightMode, Logout } from '@mui/icons-material';
import { useTheme } from '@/contexts/theme';
import { useAuth } from '@/contexts/auth';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FinanceVerse
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">
              Olá, {user.name}
            </Typography>
            <IconButton color="inherit" onClick={toggleTheme}>
              {theme === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
            <IconButton color="inherit" onClick={logout}>
              <Logout />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" href="/login">
              Login
            </Button>
            <Button color="inherit" href="/register">
              Registrar
            </Button>
            <IconButton color="inherit" onClick={toggleTheme}>
              {theme === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
