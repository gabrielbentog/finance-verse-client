"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Box, Button, Stack, TextField, Typography, Divider, Alert } from "@mui/material"
import { useForm, Controller } from "react-hook-form"
import { updateProfile } from "@/services/userService"
import { useAuth } from "@/contexts/auth"
import type { UserData } from "@/types/auth"

interface ProfileEditFormProps {
  user: UserData | null
  onSaved?: (user: UserData) => void
  onCancel?: () => void
  showAvatarSection?: boolean // mantido para compatibilidade (não usado aqui)
  editing?: boolean
  setSubmit?: (fn: () => void) => void
}

type FormValues = {
  name: string
  email: string
  avatarFile?: FileList | null
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  user,
  onSaved,
  onCancel,
  showAvatarSection = false, // continuamos escondendo a seção de avatar
  editing = false,
  setSubmit,
}) => {
  const { updateUser } = useAuth()
  const { control, handleSubmit, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      avatarFile: null,
    },
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setValue("name", user?.name ?? "")
    setValue("email", user?.email ?? "")
  }, [user, setValue])

  const onSubmit = useCallback(async (data: FormValues) => {
    setSaving(true)
    try {
      setMessage(null)
      setErrorMessage(null)

      if (!user || user.id == null) {
        setErrorMessage("Usuário não encontrado. Recarregue a página e tente novamente.")
        setSaving(false)
        return
      }

      // Monta payload: inclui avatar somente se for File (novo upload).
      const avatar = data.avatarFile && data.avatarFile.length > 0 ? data.avatarFile[0] : undefined
      if (avatar instanceof File && avatar.size > 2 * 1024 * 1024) {
        setErrorMessage("Imagem muito grande. Máx 2MB.")
        setSaving(false)
        return
      }

      const payload: { id: number | string; name?: string; email?: string; avatar?: File | null } = {
        id: user.id,
        name: data.name,
        email: data.email,
      }
      if (avatar instanceof File) payload.avatar = avatar

      // Se não houve nenhuma alteração (nome/email iguais e nenhum arquivo novo), não chama API
      const noChanges = (user.name === data.name) && (user.email === data.email) && !(avatar instanceof File)
      if (noChanges) {
        // Não exibe a mensagem de sucesso se nada mudou
        setSaving(false)
        return
      }

      const updated = await updateProfile(payload)
      try {
        localStorage.setItem("user", JSON.stringify(updated))
      } catch {}
      if (updateUser) updateUser(updated)
      if (onSaved) onSaved(updated)

      // Apenas mostrar mensagem de sucesso se de fato houveram diferenças no retorno
      const changed = (updated.name !== user.name) || (updated.email !== user.email) || ((updated.avatarUrl ?? null) !== (user.avatarUrl ?? null))
      if (changed) {
        setMessage("Perfil atualizado com sucesso")
      }
    } catch (err) {
      console.error("Erro ao salvar perfil", err)
      setErrorMessage("Erro ao salvar perfil. Tente novamente.")
    } finally {
      setSaving(false)
      // limpa o campo de arquivo para permitir o mesmo arquivo novamente em outra tentativa
      reset({ name: data.name, email: data.email, avatarFile: null })
    }
  }, [user, updateUser, onSaved, reset])

  // Se o pai quiser controlar o submit (botão Salvar no header), expomos a função
  useEffect(() => {
    if (!setSubmit) return
    const submitFn = () => {
      handleSubmit(onSubmit)()
    }
    setSubmit(submitFn)
    // limpar no unmount
    return () => setSubmit(() => {})
  }, [setSubmit, handleSubmit, onSubmit])

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={4}>
        {/* Informações Pessoais */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "text.primary" }}>
            Informações Pessoais
          </Typography>
          <Stack spacing={3}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Nome é obrigatório" }}
              render={({ field, fieldState }) => (
                <TextField
                  label="Nome completo"
                  fullWidth
                  {...field}
                  error={!!fieldState.error}
                  disabled={!editing}
                  helperText={fieldState.error?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#667eea",
                    },
                  }}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email é obrigatório",
                pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido" },
              }}
              render={({ field, fieldState }) => (
                <TextField
                  label="Endereço de email"
                  fullWidth
                  {...field}
                  error={!!fieldState.error}
                  disabled={!editing}
                  helperText={fieldState.error?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#667eea",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#667eea",
                    },
                  }}
                />
              )}
            />
          </Stack>
        </Box>

        {message && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            {message}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Divider />

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 2 }}>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={() => {
              reset({
                name: user?.name ?? "",
                email: user?.email ?? "",
                avatarFile: null,
              })
              onCancel?.()
            }}
            sx={{
              borderColor: "grey.300",
              color: "text.secondary",
              minWidth: 120,
            }}
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            sx={{
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              minWidth: 160,
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
              },
            }}
            disabled={saving || !editing}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}

export default ProfileEditForm
