"use client";

import React, { useEffect, useState } from 'react';
import { Box, Button, Avatar, Stack, TextField, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { updateProfile } from '@/services/userService';
import { useAuth } from '@/contexts/auth';
import { UserData } from '@/types/auth';

interface ProfileEditFormProps {
  user: UserData | null;
  onSaved?: (user: UserData) => void;
}

type FormValues = {
  name: string;
  email: string;
  avatarFile?: FileList | null;
};

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onSaved }) => {
  const { updateUser } = useAuth();
  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      avatarFile: null,
    }
  });

  const [preview, setPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setValue('name', user?.name ?? '');
    setValue('email', user?.email ?? '');
    setPreview(user?.avatarUrl ?? null);
  }, [user, setValue]);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      setMessage(null);
      setErrorMessage(null);
      const avatar = data.avatarFile && data.avatarFile.length > 0 ? data.avatarFile[0] : null;
      // validação simples de tamanho (2MB)
      if (avatar && avatar.size > 2 * 1024 * 1024) {
        setErrorMessage('Imagem muito grande. Máx 2MB.');
        setSaving(false);
        return;
      }

      if (!user || user.id === undefined || user.id === null) {
        setErrorMessage('Usuário não encontrado. Recarregue a página e tente novamente.');
        setSaving(false);
        return;
      }

      const updated = await updateProfile({ id: user.id, name: data.name, email: data.email, avatar });
      // Atualiza preview e dispara callback
  setPreview(updated.avatarUrl ?? null);
  setMessage('Perfil atualizado com sucesso');

  // Persistir em localStorage e atualizar contexto global quando disponível
  try { localStorage.setItem('user', JSON.stringify(updated)); } catch { }
  if (updateUser) updateUser(updated);

  if (onSaved) onSaved(updated);
    } catch (err) {
      console.error('Erro ao salvar perfil', err);
      setErrorMessage('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3} sx={{ maxWidth: 720 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Avatar
            src={preview ?? undefined}
            sx={{ width: 96, height: 96, bgcolor: '#667eea', fontSize: 32 }}
          >
            {!preview && (user?.name?.charAt(0) ?? 'U')}
          </Avatar>

          <Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Imagem de Perfil</Typography>
            <Controller
              name="avatarFile"
              control={control}
              render={({ field }) => (
                <>
                  <label style={{ cursor: 'pointer', color: '#667eea', fontWeight: 600 }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        field.onChange(e.target.files);
                        const file = e.target.files && e.target.files[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setPreview(url);
                        } else {
                          setPreview(user?.avatarUrl ?? null);
                        }
                      }}
                    />
                    <Box component="span">Clique para selecionar imagem</Box>
                  </label>
                  <Typography variant="caption" color="text.secondary">PNG/JPG, até 2MB</Typography>
                </>
              )}
            />
          </Stack>
        </Box>

        <Controller
          name="name"
          control={control}
          rules={{ required: 'Nome é obrigatório' }}
          render={({ field, fieldState }) => (
            <TextField
              label="Nome"
              fullWidth
              {...field}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Email é obrigatório',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' }
          }}
          render={({ field, fieldState }) => (
            <TextField
              label="Email"
              fullWidth
              {...field}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        {message && <Typography color="success.main">{message}</Typography>}
        {errorMessage && <Typography color="error.main">{errorMessage}</Typography>}

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>

          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={() => {
              // reset preview to current user avatar
              setPreview(user?.avatarUrl ?? null);
            }}
            sx={{ borderColor: 'divider' }}
          >
            Reverter
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ProfileEditForm;
