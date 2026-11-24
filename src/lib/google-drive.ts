import { google } from 'googleapis';
import { DriveFile } from './types';
import { formatBytes } from './azure-blob';

// Memória local de arquivos de exemplo (Modo Demonstração) caso as credenciais do Google ainda não tenham sido configuradas
let demoFiles: Array<DriveFile & { content: Buffer }> = [
  {
    id: 'demo-file-1',
    name: 'relatorio_financeiro_2026.pdf',
    mimeType: 'application/pdf',
    size: 245760,
    sizeFormatted: formatBytes(245760),
    modifiedTime: new Date(Date.now() - 3600000 * 24).toISOString(),
    webViewLink: 'https://drive.google.com/file/d/demo-file-1',
    content: Buffer.from('%PDF-1.4\n%Relatorio Financeiro de Migracao - Google Drive para Azure Blob Storage.\nEste arquivo simula um documento PDF transferido com sucesso.\nStatus: Validado.\n%%EOF'),
  },
  {
    id: 'demo-file-2',
    name: 'planilha_custos_nuvem.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 104857,
    sizeFormatted: formatBytes(104857),
    modifiedTime: new Date(Date.now() - 3600000 * 12).toISOString(),
    webViewLink: 'https://drive.google.com/file/d/demo-file-2',
    content: Buffer.from('Planilha de Custos Cloud - Stop2 Nuvem - Migracao de Dados Azure Blob Storage'),
  },
  {
    id: 'demo-file-3',
    name: 'arquitetura_solucao.png',
    mimeType: 'image/png',
    size: 512000,
    sizeFormatted: formatBytes(512000),
    modifiedTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    webViewLink: 'https://drive.google.com/file/d/demo-file-3',
    content: Buffer.from('\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'),
  },
  {
    id: 'demo-file-4',
    name: 'especificacao_projeto.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 78900,
    sizeFormatted: formatBytes(78900),
    modifiedTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    webViewLink: 'https://drive.google.com/file/d/demo-file-4',
    content: Buffer.from('Documento Word de especificacao de integracao Cloud Google Drive to Azure Blob Storage'),
  },
  {
    id: 'demo-file-5',
    name: 'dados_migracao.csv',
    mimeType: 'text/csv',
    size: 15420,
    sizeFormatted: formatBytes(15420),
    modifiedTime: new Date().toISOString(),
    webViewLink: 'https://drive.google.com/file/d/demo-file-5',
    content: Buffer.from('id,nome,origem,destino,status\n1,arquivo1,google_drive,azure_blob,pendente\n2,arquivo2,google_drive,azure_blob,sucesso\n'),
  },
];

/**
 * Obtém o cliente autenticado do Google Drive
 */
export function getGoogleDriveClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    return null;
  }

  // Normaliza quebras de linha na chave privada
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Verifica se as credenciais do Google Drive estão configuradas
 */
export function isGoogleDriveConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
}

/**
 * Função para listar os dados de origem (google drive)
 */
export async function listSourceFiles(customFolderId?: string): Promise<{ files: DriveFile[]; isDemo: boolean; error?: string }> {
  const folderId = customFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID;
  const drive = getGoogleDriveClient();

  if (!drive) {
    // Se não estiver configurado, retorna os arquivos de demonstração funcionais
    return {
      files: demoFiles.map(({ content, ...f }) => f),
      isDemo: true,
    };
  }

  try {
    if (folderId) {
      const folder = await drive.files.get({
        fileId: folderId,
        fields: 'id,name,mimeType',
      });

      if (folder.data.mimeType !== 'application/vnd.google-apps.folder') {
        throw new Error('GOOGLE_DRIVE_FOLDER_ID não corresponde a uma pasta do Google Drive.');
      }
    }

    let query = "trashed = false";
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)',
      pageSize: 100,
      orderBy: 'modifiedTime desc',
    });

    const items = response.data.files || [];

    const files: DriveFile[] = items.map((item) => {
      const sizeNum = item.size ? parseInt(item.size, 10) : 0;
      return {
        id: item.id || '',
        name: item.name || 'sem_nome',
        mimeType: item.mimeType || 'application/octet-stream',
        size: sizeNum,
        sizeFormatted: formatBytes(sizeNum),
        modifiedTime: item.modifiedTime || undefined,
        webViewLink: item.webViewLink || undefined,
        isFolder: item.mimeType === 'application/vnd.google-apps.folder',
      };
    });

    return { files, isDemo: false };
  } catch (error: any) {
    console.error('[GOOGLE DRIVE] Erro ao listar arquivos:', error.message || error);
    const code = error?.response?.status ?? error?.code;
    const message =
      code === 404 || code === '404'
        ? `Pasta do Google Drive não encontrada ou não compartilhada com a Service Account (ID: ${folderId}).`
        : error.message || 'Erro ao conectar ao Google Drive.';

    return {
      files: [],
      isDemo: false,
      error: message,
    };
  }
}

/**
 * Baixa um arquivo do Google Drive
 */
export async function downloadDriveFile(
  fileId: string,
  mimeType?: string
): Promise<{ buffer: Buffer; name?: string; contentType: string }> {
  // Verifica se é um arquivo do modo de demonstração
  const demo = demoFiles.find((f) => f.id === fileId);
  if (demo) {
    return {
      buffer: demo.content,
      name: demo.name,
      contentType: demo.mimeType,
    };
  }

  const drive = getGoogleDriveClient();
  if (!drive) {
    throw new Error('Credenciais do Google Drive não configuradas e arquivo não encontrado no cache local.');
  }

  // Tratamento especial para documentos nativos do Google (Docs, Sheets, Slides)
  if (mimeType === 'application/vnd.google-apps.document') {
    const res = await drive.files.export(
      { fileId, mimeType: 'application/pdf' },
      { responseType: 'arraybuffer' }
    );
    return {
      buffer: Buffer.from(res.data as ArrayBuffer),
      contentType: 'application/pdf',
    };
  }

  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    const res = await drive.files.export(
      { fileId, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      { responseType: 'arraybuffer' }
    );
    return {
      buffer: Buffer.from(res.data as ArrayBuffer),
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  if (mimeType === 'application/vnd.google-apps.presentation') {
    const res = await drive.files.export(
      { fileId, mimeType: 'application/pdf' },
      { responseType: 'arraybuffer' }
    );
    return {
      buffer: Buffer.from(res.data as ArrayBuffer),
      contentType: 'application/pdf',
    };
  }

  // Arquivos normais (binários, imagens, zip, etc.)
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );

  return {
    buffer: Buffer.from(response.data as ArrayBuffer),
    contentType: mimeType || 'application/octet-stream',
  };
}

/**
 * Adiciona um arquivo dinâmico na lista de demonstração (útil para testes manuais na UI)
 */
export function addDemoFile(name: string, content: Buffer, mimeType = 'text/plain'): DriveFile {
  const id = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const file: DriveFile & { content: Buffer } = {
    id,
    name,
    mimeType,
    size: content.length,
    sizeFormatted: formatBytes(content.length),
    modifiedTime: new Date().toISOString(),
    content,
  };
  demoFiles.unshift(file);
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: file.size,
    sizeFormatted: file.sizeFormatted,
    modifiedTime: file.modifiedTime,
  };
}

/**
 * Testa a conexão com o Google Drive
 */
export async function testGoogleDriveConnection(folderId?: string) {
  const configured = isGoogleDriveConfigured();
  if (!configured) {
    return {
      connected: false,
      configured: false,
      isDemoMode: true,
      fileCount: demoFiles.length,
      message: 'Credenciais do Google Service Account não configuradas no .env.local. Modo de demonstração ativo.',
    };
  }

  try {
    const { files, isDemo, error } = await listSourceFiles(folderId);
    return {
      connected: !isDemo && !error,
      configured: true,
      isDemoMode: isDemo,
      fileCount: files.length,
      folderId: folderId || process.env.GOOGLE_DRIVE_FOLDER_ID,
      error,
    };
  } catch (error: any) {
    return {
      connected: false,
      configured: true,
      isDemoMode: true,
      error: error.message || 'Erro ao conectar à API do Google Drive',
    };
  }
}
