"use client"

import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  
  Paper,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import QrCode2Icon from '@mui/icons-material/QrCode2'

import {
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  regenerateBackupCodes,
} from '@/services/userService'
import { useAuth } from '@/contexts/auth'
import { getUserById } from '@/services/userService'

export default function TwoFactorSettings() {
  const { user, updateUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [setupData, setSetupData] = useState<Record<string, unknown> | null>(null)
  const setupObj = setupData as Record<string, unknown> | null
  const issuer = typeof setupObj?.['issuer'] === 'string' ? (setupObj['issuer'] as string) : undefined
  const account = typeof setupObj?.['account'] === 'string' ? (setupObj['account'] as string) : undefined
  const provisioningUri = typeof setupObj?.['provisioning_uri'] === 'string' ? (setupObj['provisioning_uri'] as string) : (typeof setupObj?.['provisioningUri'] === 'string' ? (setupObj['provisioningUri'] as string) : undefined)
  const [code, setCode] = useState('')
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // derive two-factor enabled: read only `twoFactorEnabled` (camelCase) from user or localStorage
  const deriveTwoFactorEnabled = (u: unknown): boolean => {
    try {
      let userObj = u as Record<string, unknown> | null
      if (!userObj) {
        const raw = localStorage.getItem('user')
        if (raw) userObj = JSON.parse(raw) as Record<string, unknown>
      }
      if (!userObj) return false

      // read only camelCase field
      const val = userObj['twoFactorEnabled']
      return Boolean(val)
    } catch {
      return false
    }
  }

  useEffect(() => {
    setEnabled(deriveTwoFactorEnabled(user))
  }, [user])

  if (!user) return null

  const openDialog = async () => {
    setError(null)
    setOpen(true)
    setSetupData(null)
    setBackupCodes(null)
    // obter provisioning_uri/qr do backend
    try {
      setLoading(true)
      const resp = await setupTwoFactor()
      setSetupData(resp as Record<string, unknown> | null)
    } catch (err) {
      console.error('Erro no setup 2FA', err)
      setError('Não foi possível iniciar a configuração. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const closeDialog = () => {
    stopScanner()
    setOpen(false)
    setCode('')
    setSetupData(null)
    setError(null)
  }

  const handleEnable = async () => {
    if (!code || code.length === 0) return setError('Informe o código de 6 dígitos')
    setLoading(true)
    setError(null)
    try {
      const res = await enableTwoFactor(code)
      const resObj = res as Record<string, unknown>
      if (resObj && resObj['enabled'] === true) {
        setEnabled(true)
        // exibir backup codes se houver
        if (Array.isArray(resObj['backup_codes'])) setBackupCodes(resObj['backup_codes'] as string[])
        // atualizar usuário local (tenta ler novamente)
          try {
          const fresh = await getUserById(user.id)
          if (updateUser) updateUser(fresh)
          try { (await import('@/services/userService')).saveUserToStorage(fresh as unknown as Record<string, unknown>) } catch {}
        } catch {}
      } else {
        setError('Não foi possível ativar 2FA')
      }
    } catch (err) {
      console.error('Erro ao ativar 2FA', err)
      setError('Código inválido ou expirado')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm('Deseja desativar a autenticação de dois fatores?')) return
    setLoading(true)
    try {
      const res = await disableTwoFactor()
      const resObj = res as Record<string, unknown>
      if (resObj && resObj['enabled'] === false) {
        setEnabled(false)
        // atualizar usuário
          try {
          const fresh = await getUserById(user.id)
          if (updateUser) updateUser(fresh)
          try { (await import('@/services/userService')).saveUserToStorage(fresh as unknown as Record<string, unknown>) } catch {}
        } catch {}
      } else {
        setError('Falha ao desativar 2FA')
      }
    } catch (err) {
      console.error('Erro ao desativar 2FA', err)
      setError('Erro ao desativar 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!confirm('Regenerar códigos de backup invalidará os anteriores. Continuar?')) return
    setLoading(true)
    try {
      const res = await regenerateBackupCodes()
      const resObj = res as Record<string, unknown>
      if (resObj && Array.isArray(resObj['backup_codes'])) {
        setBackupCodes(resObj['backup_codes'] as string[])
      } else {
        setError('Não foi possível regenerar códigos')
      }
    } catch (err) {
      console.error('Erro ao regenerar backup codes', err)
      setError('Erro ao regenerar códigos')
    } finally {
      setLoading(false)
    }
  }

  // Scanner via BarcodeDetector (fallback se disponível)
  const startScanner = async () => {
    setError(null)
    setShowScanner(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      // BarcodeDetector typing via unknown to avoid explicit any
      type BarcodeDetectorCtor = new (options: Record<string, unknown>) => { detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> }
      const BarcodeDetectorClass = (window as unknown as Record<string, unknown>)['BarcodeDetector'] as unknown as BarcodeDetectorCtor | undefined
      if (!BarcodeDetectorClass) {
        setError('Scanner não disponível no seu navegador')
        return
      }
      const detector = new BarcodeDetectorClass({ formats: ['qr_code'] })

      const loop = async () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) {
          requestAnimationFrame(loop)
          return
        }
        try {
          const detections = await detector.detect(videoRef.current)
          if (detections && detections.length > 0) {
            const val = detections[0].rawValue
            // Se detectou provisioning_uri, preenche e fecha scanner
            if (val && typeof val === 'string') {
              // preenche provisioning_uri no setupData para mostrar ao usuário
              setSetupData(prev => ({ ...(prev || {}), provisioning_uri: val }))
              stopScanner()
              setShowScanner(false)
              return
            }
          }
        } catch {
          // ignora pequenos erros e continua
        }
        requestAnimationFrame(loop)
      }
      requestAnimationFrame(loop)
    } catch (err) {
      console.error('Erro ao acessar câmera para scanner', err)
      setError('Não foi possível acessar a câmera')
      setShowScanner(false)
    }
  }

  const stopScanner = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    } catch {}
    if (videoRef.current) {
      try { videoRef.current.pause() } catch {}
      videoRef.current.srcObject = null
    }
    streamRef.current = null
    setShowScanner(false)
  }

  const copyToClipboard = async (text?: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  const renderQr = () => {
    if (!setupData) return null
    // try multiple possible keys (some backends use slightly different names)
    const qrDataUri = (setupObj?.['qr_svg_data_uri'] || setupObj?.['qr_svg_dataUri'] || setupObj?.['qr_svg_base64'] || setupObj?.['qr_svg_b64']) as string | undefined
    const qrSvgRaw = (setupObj?.['qr_svg'] || setupObj?.['qrSvg'] || setupObj?.['qr_svg_string']) as string | undefined
    const provisioning = (setupObj?.['provisioning_uri'] || setupObj?.['provisioningUri'] || setupObj?.['provisioning']) as string | undefined

    // helper: is base64
    const isBase64 = (s?: string) => {
      if (!s) return false
      // allow data: URIs too
      if (s.startsWith('data:')) return true
      // simple base64 check (may be false negative for short strings)
      return /^[A-Za-z0-9+/=\s]+$/.test(s)
    }

    const wrapperSx = {
  width: { xs: '100%', sm: 260 },
  height: { xs: 220, sm: 260 },
  flex: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // give quiet zone and white background to avoid QR being cut
  p: 1,
  borderRadius: 1,
  bgcolor: 'common.white',
  // allow the image/svg to scale without stretching height
  '& img': { maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' },
  '& svg': { maxWidth: '100%', width: '100%', height: 'auto', display: 'block' },
    }

    // 1) qrDataUri: may already be a proper data URI or raw base64
  if (qrDataUri) {
      let src = qrDataUri
      if (!src.startsWith('data:')) {
        // assume it's base64 svg without prefix
        if (isBase64(src)) {
          src = `data:image/svg+xml;base64,${src}`
        }
      }
  return <Box sx={wrapperSx}><Box component="img" src={src} alt="QR Code 2FA" sx={{ display: 'block' }} /></Box>
    }

    // 2) qrSvgRaw: could be raw svg string or base64-encoded svg
    if (qrSvgRaw) {
      // if it looks like base64, decode then render
      if (!qrSvgRaw.includes('<svg') && isBase64(qrSvgRaw)) {
        try {
          const decoded = atob(qrSvgRaw)
          return <Box sx={wrapperSx}><Box sx={{ width: '100%' }} dangerouslySetInnerHTML={{ __html: decoded }} /></Box>
        } catch {
          // fallthrough to try rendering as data URI
          const maybe = `data:image/svg+xml;base64,${qrSvgRaw}`
          return <Box sx={wrapperSx}><Box component="img" src={maybe} alt="QR Code 2FA" sx={{ display: 'block' }} /></Box>
        }
      }
      // if contains <svg>, render it directly
      if (qrSvgRaw.includes('<svg')) {
        return <Box sx={wrapperSx}><Box sx={{ width: '100%' }} dangerouslySetInnerHTML={{ __html: qrSvgRaw }} /></Box>
      }
      // last resort: try as data URI
      try {
        return <Box sx={wrapperSx}><Box component="img" src={qrSvgRaw} alt="QR Code 2FA" sx={{ display: 'block' }} /></Box>
      } catch {
        // continue
      }
    }

    // 3) provisioning_uri fallback: use Google Charts as fallback (external)
    if (provisioning) {
      const src = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(provisioning)}`
      return <Box sx={wrapperSx}><Box component="img" src={src} alt="QR Code 2FA" sx={{ display: 'block' }} /></Box>
    }

    return null
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Autenticação de dois fatores (2FA)</Typography>

      {enabled ? (
        <Stack spacing={2} direction="row" alignItems="center">
          <Typography>2FA está ativado para sua conta.</Typography>
          <Button
            variant="outlined"
            color="inherit"
            onClick={openDialog}
            sx={{ minWidth: 160, borderColor: 'grey.300' }}
            startIcon={<QrCode2Icon />}
          >
            Gerenciar 2FA
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDisable}
            sx={{ background: 'linear-gradient(90deg, #ef4444, #d946ef)' }}
          >
            Desativar 2FA
          </Button>
        </Stack>
      ) : (
        <Stack spacing={2} direction="row" alignItems="center">
          <Typography>Proteja sua conta ativando 2FA.</Typography>
          <Button
            variant="contained"
            onClick={openDialog}
            sx={{
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              minWidth: 160,
              boxShadow: '0 6px 18px rgba(102,126,234,0.24)'
            }}
          >
            Ativar 2FA
          </Button>
        </Stack>
      )}

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Configurar Autenticação de Dois Fatores
          <IconButton onClick={closeDialog}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">Siga os passos abaixo para ativar 2FA na sua conta.</Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start',
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              {/* QR column */}
              <Box
                sx={{
                  flex: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: { xs: '100%', sm: 240 },
                  mb: { xs: 1.5, sm: 0 },
                }}
              >
                {renderQr() || (
                  <Box sx={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">QR indisponível</Typography>
                  </Box>
                )}
              </Box>

              {/* Metadata column */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1">Escaneie o QR com seu app autenticador</Typography>

                {/* issuer / account */}
                {(issuer || account) && (
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {issuer && <Typography variant="caption" color="text.secondary">Issuer: {issuer}</Typography>}
                    {account && <Typography variant="caption" color="text.secondary">Conta: {account}</Typography>}
                  </Box>
                )}

                {/* provisioning uri box */}
                {/* <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>URI (use se precisar):</Typography>
                  <Box
                    component="code"
                    sx={{
                      display: 'block',
                      p: 1,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      wordBreak: 'break-all',
                      maxHeight: 88,
                      overflow: 'auto',
                    }}
                  >
                    {provisioningUri ?? 'Aguardando QR...'}
                  </Box>
                </Box> */}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => copyToClipboard(provisioningUri)}
                    startIcon={<ContentCopyIcon />}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Copiar URI
                  </Button>

                  {typeof (window as unknown as Record<string, unknown>)['BarcodeDetector'] !== 'undefined' && (
                    <Button size="small" variant="outlined" onClick={startScanner} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                      Ler QR (câmera)
                    </Button>
                  )}
                </Stack>
              </Box>
            </Paper>

            {showScanner && (
              <Box>
                <Typography variant="body2">Aponte a câmera para o QR code</Typography>
                <video ref={videoRef} style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button variant="outlined" onClick={stopScanner}>Parar</Button>
                </Stack>
              </Box>
            )}

            <Divider />

            <Box>
              <Typography variant="subtitle2">Verificar código</Typography>
              <TextField
                label="Código 2FA"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                fullWidth
                sx={{ mt: 1 }}
                inputProps={{ maxLength: 6 }}
              />
              {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            </Box>

            {backupCodes && (
              <Box>
                <Typography variant="subtitle2">Códigos de backup</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {backupCodes.map((c) => (
                    <Paper key={c} sx={{ px: 1, py: 0.5, fontFamily: 'monospace', fontSize: '0.85rem' }}>{c}</Paper>
                  ))}
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" onClick={() => copyToClipboard((backupCodes || []).join('\n'))}>Copiar</Button>
                  <Button size="small" onClick={() => {
                    const blob = new Blob([(backupCodes || []).join('\n')], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'financeverse-backup-codes.txt'
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                    URL.revokeObjectURL(url)
                  }}>Baixar</Button>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} color="inherit" variant="outlined">Cancelar</Button>
          {enabled ? (
            <>
              <Button onClick={handleRegenerate} variant="outlined">Regenerar códigos</Button>
              <Button onClick={handleDisable} color="error" variant="contained">Desativar 2FA</Button>
            </>
          ) : (
            <Button onClick={handleEnable} variant="contained" sx={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }}>
              {loading ? 'Processando...' : 'Verificar e ativar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}
