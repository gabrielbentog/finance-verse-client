'use client';

import { Box, Toolbar } from '@mui/material';
import { NavBar } from '@/components/navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fb' }}>
        <NavBar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100% - 280px)` },
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            p: 0,
          }}
        >
          <Toolbar />
          <Box sx={{ flex: 1, height: '100%' }}>
            {children}
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
