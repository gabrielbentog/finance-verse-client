'use client';

import { Box, Toolbar } from '@mui/material';
import { NavBar } from '@/components/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <NavBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
