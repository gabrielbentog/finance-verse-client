'use client';

import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeStore } from '@/store/themeStore';
import { lightTheme, darkTheme } from '@/lib/theme';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from '@/contexts/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  return (
    <MUIThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </SnackbarProvider>
    </MUIThemeProvider>
  );
}
