'use client';

import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  MonetizationOn,
  Receipt,
  PieChart,
  Brightness4,
  Brightness7,
  AccountBalanceWallet,
  LogoutOutlined,
} from '@mui/icons-material';
import { useThemeStore } from '@/store/themeStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth';

const drawerWidth = 280;

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, href: '/dashboard' },
    { text: 'Receitas', icon: <MonetizationOn />, href: '/receitas' },
    { text: 'Despesas', icon: <Receipt />, href: '/despesas' },
    { text: 'Relatórios', icon: <PieChart />, href: '/relatorios' },
  ];

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        py: 2, 
        px: 3,
        height: '64px',
      }}>
        <AccountBalanceWallet sx={{ 
          mr: 1.5, 
          color: 'primary.main',
          background: isDarkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.1)',
          p: 0.5,
          borderRadius: 1,
        }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Finance Verse
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ 
        mt: 2,
        px: 2,
        overflowY: 'auto',
        flexGrow: 1,
      }}>
        <List>
          {menuItems.map((item) => {
            // Para o Dashboard, queremos uma correspondência exata
            // Para os outros itens, verificamos se a URL contém o path do item
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname?.includes(item.href.substring(1));
            
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  component={Link} 
                  href={item.href}
                  sx={{
                    borderRadius: 2,
                    background: isActive ? 'linear-gradient(90deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))' : 'transparent',
                    color: isActive ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      background: isActive 
                        ? 'linear-gradient(90deg, rgba(102, 126, 234, 0.25), rgba(118, 75, 162, 0.25))'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                    position: 'relative',
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '25%',
                      height: '50%',
                      width: '4px',
                      borderRadius: '0 4px 4px 0',
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    } : {},
                    pl: isActive ? 3 : 2,
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? 'primary.main' : 'text.secondary',
                    minWidth: '40px',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      
      <Divider sx={{ mt: 'auto' }} />
      
      <Box sx={{ p: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 2,
            p: 1.5,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36,
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.name || 'Usuário'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'usuario@email.com'}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <Tooltip title="Alterar tema">
              <IconButton size="small" onClick={toggleTheme} sx={{ mr: 0.5 }}>
                {isDarkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Sair">
              <IconButton size="small" color="inherit" onClick={logout}>
                <LogoutOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: 2000,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Finance Verse
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
}
