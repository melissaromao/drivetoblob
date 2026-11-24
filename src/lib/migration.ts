import { listSourceFiles, downloadDriveFile } from './google-drive';
import { uploadToBlob } from './azure-blob';
import { MigrationResult, MigrationSummary } from './types';

/**
 * Executa a migração de arquivos do Google Drive para o Azure Blob Storage
 * e exibe no console o status de cada transferência (sucesso ou erro)
 */
export async function migrateFiles(params?: {
  fileIds?: string[];
  containerName?: string;
  folderId?: string;
}): Promise<MigrationSummary> {
  const { fileIds, containerName, folderId } = params || {};
  const logs: string[] = [];

  const addLog = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const logLine = `[${timestamp}] ${message}`;
    logs.push(logLine);
    if (isError) {
      console.error(`\x1b[31m${logLine}\x1b[0m`);
    } else {
      console.log(`\x1b[32m${logLine}\x1b[0m`);
    }
  };

  addLog('================================================================');
  addLog('🚀 [INÍCIO DA MIGRAÇÃO] Google Drive ➔ Azure Blob Storage');
  addLog(`Destino Contêiner: ${containerName || process.env.AZURE_STORAGE_CONTAINER_NAME || 'aluno-melissa'}`);
  addLog('================================================================');

  // 1. Obter lista de arquivos de origem
  const { files: sourceFiles } = await listSourceFiles(folderId);

  // Filtrar arquivos a serem migrados
  const targets = fileIds && fileIds.length > 0
    ? sourceFiles.filter((f) => fileIds.includes(f.id))
    : sourceFiles.filter((f) => !f.isFolder);

  if (targets.length === 0) {
    addLog('⚠️ Nenhum arquivo elegível encontrado para migração.');
    return {
      total: 0,
      successful: 0,
      failed: 0,
      totalBytes: 0,
      results: [],
      logs,
    };
  }

  addLog(`📦 Total de arquivos selecionados para migração: ${targets.length}`);

  const results: MigrationResult[] = [];
  let successful = 0;
  let failed = 0;
  let totalBytes = 0;

  for (const file of targets) {
    const startTime = Date.now();
    addLog(`⏳ [INICIANDO TRANSFERÊNCIA] Arquivo: "${file.name}" (${file.sizeFormatted || file.size + ' B'})`);

    try {
      // 2. Download da origem (Google Drive)
      const downloaded = await downloadDriveFile(file.id, file.mimeType);

      // 3. Upload para o destino (Azure Blob Storage)
      const uploadResult = await uploadToBlob(
        file.name,
        downloaded.buffer,
        downloaded.contentType,
        {
          sourceDriveId: file.id,
          originalName: file.name,
          migratedAt: new Date().toISOString(),
        },
        containerName
      );

      const durationMs = Date.now() - startTime;
      successful++;
      totalBytes += downloaded.buffer.length;

      const successMsg = `✅ [SUCESSO] Arquivo "${file.name}" copiado com sucesso para Azure Blob Storage em ${durationMs}ms! URL: ${uploadResult.url}`;
      addLog(successMsg);

      results.push({
        fileId: file.id,
        fileName: file.name,
        blobName: file.name,
        size: downloaded.buffer.length,
        status: 'success',
        message: 'Transferido com sucesso para Azure Blob Storage',
        transferredAt: new Date().toISOString(),
        durationMs,
      });
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      failed++;

      const errorMsg = `❌ [ERRO] Falha ao transferir arquivo "${file.name}": ${error.message || error}`;
      addLog(errorMsg, true);

      results.push({
        fileId: file.id,
        fileName: file.name,
        blobName: file.name,
        size: file.size,
        status: 'error',
        message: error.message || 'Erro desconhecido na migração',
        transferredAt: new Date().toISOString(),
        durationMs,
      });
    }
  }

  addLog('================================================================');
  addLog(`🏁 [MIGRAÇÃO CONCLUÍDA] Total: ${targets.length} | Sucessos: ${successful} | Falhas: ${failed}`);
  addLog('================================================================');

  return {
    total: targets.length,
    successful,
    failed,
    totalBytes,
    results,
    logs,
  };
}
