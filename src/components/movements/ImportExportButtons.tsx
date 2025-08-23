import React, { useRef, useState } from 'react';
import { Box, IconButton, Stack, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { importMovements, downloadTemplateFile } from '@/services/importService';

interface ImportError {
  response?: {
    data?: {
      errors?: Array<{
        row: number;
        errors: string[];
      }>;
    };
  };
}

interface ImportButtonProps {
  onImportSuccess: () => void;
  onError: (message: string) => void;
}

export function ImportExportButtons({ onImportSuccess, onError }: ImportButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await importMovements(file);
      onImportSuccess();
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      const apiError = error as ImportError;
      if (apiError.response?.data?.errors) {
        // Formatando os erros da API
        const errorMessages = apiError.response.data.errors
          .map(err => `Linha ${err.row}: ${err.errors.join(', ')}`)
          .join('\\n');
        onError(`Erros na importação:\\n${errorMessages}`);
      } else {
        onError('Erro ao importar arquivo. Verifique o formato e tente novamente.');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Ajuda">
          <IconButton
            onClick={() => setIsHelpOpen(true)}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Baixar modelo de planilha">
          <IconButton
            onClick={() => downloadTemplateFile()}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Importar planilha">
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <UploadFileIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog
        open={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
            },
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
          Formato do Arquivo de Importação
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            O arquivo deve ser uma planilha (.xlsx, .xls ou .csv) com as seguintes colunas:
          </DialogContentText>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Coluna</strong></TableCell>
                  <TableCell><strong>Formato</strong></TableCell>
                  <TableCell><strong>Descrição</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>DD/MM/AAAA</TableCell>
                  <TableCell>Data da movimentação</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Valor</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Valor da movimentação</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Texto</TableCell>
                  <TableCell>Descrição da movimentação</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Texto</TableCell>
                  <TableCell>Categoria da movimentação</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Texto</TableCell>
                  <TableCell>Receita ou Despesa</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}