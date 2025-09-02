"use client";

import { Box, Container, Paper, Typography, Avatar, Button, Stack } from '@mui/material';
import { useAuth } from '@/contexts/auth';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { useState } from 'react';
import { UserData } from '@/types/auth';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);

  const handleSaved = (updatedUser: Record<string, unknown>) => {
    try { localStorage.setItem('user', JSON.stringify(updatedUser)); } catch { }
    if (updateUser) updateUser(updatedUser as unknown as UserData);
    setEditing(false);
  };

  return (
    <Box sx={{ bgcolor: '#f5f7fb', height: '100%' }}>
      <Container maxWidth={false} sx={{ py: 3, pl: { xs: 2, sm: 2 }, pr: { xs: 2, sm: 3 }, maxWidth: 'xl' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, background: 'linear-gradient(90deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Meu Perfil</Typography>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <Avatar src={user?.avatarUrl ?? undefined} sx={{ width: 96, height: 96, bgcolor: '#667eea', fontSize: 32 }}>{!user?.avatarUrl && (user?.name?.charAt(0) ?? 'U')}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Box>
              <Button variant="contained" sx={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }} onClick={() => setEditing(true)}>Editar</Button>
            </Box>
          </Stack>
        </Paper>

        {editing ? (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <ProfileEditForm user={user} onSaved={handleSaved} />
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Typography color="text.secondary">Aqui você pode visualizar as informações do seu perfil. Clique em editar para atualizar seu nome e imagem de perfil.</Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
