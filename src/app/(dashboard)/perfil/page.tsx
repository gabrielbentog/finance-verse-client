"use client"

import { Box, Container, Paper, Typography, Avatar, Button, Stack, Chip, IconButton } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import { useAuth } from "@/contexts/auth"
import ProfileEditForm from "@/components/profile/ProfileEditForm"
import TwoFactorSettings from '@/components/profile/TwoFactor'
import { useRef, useState } from "react"
import type { UserData } from "@/types/auth"
import { updateProfile } from "@/services/userService"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [submitFn, setSubmitFn] = useState<() => void>(() => {})

  // input de arquivo oculto para trocar avatar ao clicar no header
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSaved = (updatedUser: UserData) => {
    try {
      (async () => { try { (await import('@/services/userService')).saveUserToStorage(updatedUser as unknown as Record<string, unknown>) } catch {} })()
    } catch {}
    if (updateUser) updateUser(updatedUser)
    setEditing(false)
  }

  const handleAvatarClick = () => {
    if (!editing) return
    fileInputRef.current?.click()
  }

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user || user.id == null) return

    // validação 2MB
    if (file.size > 2 * 1024 * 1024) {
      // você pode trocar por snackbar/toast, mantive silencioso para não poluir
      alert("Imagem muito grande. Máx 2MB.")
      e.target.value = ""
      return
    }

    setSavingAvatar(true)
    try {
      const updated = await updateProfile({ id: user.id, avatar: file }) // envia somente se houver arquivo
      try {
        localStorage.setItem("user", JSON.stringify(updated))
      } catch {}
      if (updateUser) updateUser(updated)
    } catch (err) {
      console.error("Erro ao atualizar avatar", err)
      alert("Erro ao atualizar avatar. Tente novamente.")
    } finally {
      setSavingAvatar(false)
      e.target.value = "" // limpa para permitir o mesmo arquivo novamente
    }
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Título */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Meu Perfil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie suas informações pessoais e preferências de conta
          </Typography>
        </Box>

        {/* Header – avatar único, clicável para trocar imagem */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            mb: 3,
            border: "1px solid",
            borderColor: "grey.200",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={4} alignItems={{ xs: "center", sm: "flex-start" }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={user?.avatarUrl ?? undefined}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "#667eea",
                  fontSize: 36,
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                  cursor: savingAvatar ? "not-allowed" : "pointer",
                  opacity: savingAvatar ? 0.7 : 1,
                }}
                onClick={savingAvatar ? undefined : handleAvatarClick}
                title={savingAvatar ? "Atualizando..." : "Clique para alterar a foto"}
              >
                {!user?.avatarUrl && (user?.name?.charAt(0) ?? "U")}
              </Avatar>

              {/* ícone de lápis sobreposto */}
              <IconButton
                size="small"
                onClick={savingAvatar ? undefined : handleAvatarClick}
                sx={{
                  position: "absolute",
                  right: -8,
                  top: 8,
                  bgcolor: "white",
                  border: "1px solid",
                  borderColor: "grey.200",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                  "&:hover": { bgcolor: "grey.50" },
                }}
                disabled={savingAvatar}
                aria-label="Alterar foto do perfil"
              >
                <EditIcon fontSize="small" />
              </IconButton>

              <Chip
                label={savingAvatar ? "Salvando..." : "Ativo"}
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: -8,
                  bgcolor: savingAvatar ? "grey.500" : "#10b981",
                  color: "white",
                  fontSize: "0.75rem",
                }}
              />

              {/* input invisível para selecionar a imagem */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </Box>

            <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {user?.name || "Nome não informado"}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {user?.email || "Email não informado"}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}>
                <Chip
                  label="Usuário"
                  variant="outlined"
                  size="small"
                  sx={{ borderColor: "#667eea", color: "#667eea" }}
                />
              </Stack>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {!editing ? (
                  <Button
                    variant="contained"
                    sx={{
                      background: "linear-gradient(90deg, #667eea, #764ba2)",
                      minWidth: 120,
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                      "&:hover": {
                        boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                      },
                    }}
                    onClick={() => setEditing(true)}
                  >
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => setEditing(false)}
                      sx={{ minWidth: 120, borderColor: 'grey.300', color: 'text.secondary' }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ background: 'linear-gradient(90deg, #667eea, #764ba2)', minWidth: 120 }}
                      onClick={() => submitFn()}
                    >
                      Salvar
                    </Button>
                    {user?.avatarUrl && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={async () => {
                          if (!user || user.id == null) return
                          const ok = confirm('Remover imagem de perfil?')
                          if (!ok) return
                          setSavingAvatar(true)
                          try {
                            const updated = await updateProfile({ id: user.id, avatar: null })
                            try {
                              (await import('@/services/userService')).saveUserToStorage(updated as unknown as Record<string, unknown>)
                            } catch {}
                            if (updateUser) updateUser(updated)
                          } catch (err) {
                            console.error('Erro ao remover avatar', err)
                            alert('Erro ao remover imagem. Tente novamente.')
                          } finally {
                            setSavingAvatar(false)
                          }
                        }}
                        sx={{ minWidth: 140, borderColor: 'transparent' }}
                      >
                        Remover imagem
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Stack>
        </Paper>

        {/* Segurança: 2FA */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            mb: 3,
            border: "1px solid",
            borderColor: "grey.200",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <TwoFactorSettings />
        </Paper>

        {/* Corpo – alterna entre texto informativo e formulário (sem avatar dentro do form) */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Editar Informações
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Atualize suas informações pessoais abaixo
            </Typography>
          </Box>

          <ProfileEditForm
            user={user}
            onSaved={handleSaved}
            onCancel={() => setEditing(false)}
            showAvatarSection={false} // sem avatar aqui para não duplicar com o header
            editing={editing}
            setSubmit={setSubmitFn}
          />
        </Paper>
      </Container>
    </Box>
  )
}
