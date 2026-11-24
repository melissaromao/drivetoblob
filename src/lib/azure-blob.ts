import { BlobServiceClient } from '@azure/storage-blob';
import { BlobFile } from './types';

export function normalizeContainerName(name?: string): string {
  const raw = name || process.env.AZURE_STORAGE_CONTAINER_NAME || 'aluno-melissa';
  // Azure container naming rules: lowercase, only alphanumeric and single hyphens
  return raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'aluno-melissa';
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getBlobServiceClient(): BlobServiceClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const sasUrl = process.env.AZURE_STORAGE_SAS_URL;

  if (connectionString) {
    return BlobServiceClient.fromConnectionString(connectionString);
  }

  if (sasUrl) {
    return new BlobServiceClient(sasUrl);
  }

  throw new Error('Nenhuma credencial do Azure Blob Storage encontrada (AZURE_STORAGE_CONNECTION_STRING ou AZURE_STORAGE_SAS_URL)');
}

export async function getContainerClient(customContainerName?: string) {
  const client = getBlobServiceClient();
  const containerName = normalizeContainerName(customContainerName);
  const containerClient = client.getContainerClient(containerName);
  
  await containerClient.createIfNotExists();
  return { containerClient, containerName };
}

/**
 * Função para listar os dados de destino (blob storage)
 */
export async function listDestinationBlobs(customContainerName?: string): Promise<BlobFile[]> {
  try {
    const { containerClient } = await getContainerClient(customContainerName);
    const blobs: BlobFile[] = [];

    for await (const blob of containerClient.listBlobsFlat({
      includeMetadata: true,
      includeTags: true,
    })) {
      const blobClient = containerClient.getBlobClient(blob.name);
      const size = blob.properties.contentLength ?? 0;
      blobs.push({
        name: blob.name,
        size,
        sizeFormatted: formatBytes(size),
        lastModified: blob.properties.lastModified ? blob.properties.lastModified.toISOString() : undefined,
        contentType: blob.properties.contentType || 'application/octet-stream',
        url: blobClient.url,
        etag: blob.properties.etag,
      });
    }

    return blobs;
  } catch (error: any) {
    console.error('[AZURE BLOB] Erro ao listar blobs:', error.message || error);
    throw error;
  }
}

/**
 * Envia um buffer ou stream para o Azure Blob Storage
 */
export async function uploadToBlob(
  blobName: string,
  content: Buffer,
  contentType: string = 'application/octet-stream',
  metadata?: Record<string, string>,
  customContainerName?: string
): Promise<{ url: string; etag?: string; size: number }> {
  const { containerClient } = await getContainerClient(customContainerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const uploadOptions = {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
    metadata: metadata || {
      migratedBy: 'DriveToBlob-App',
      migratedAt: new Date().toISOString(),
    },
  };

  const response = await blockBlobClient.uploadData(content, uploadOptions);

  return {
    url: blockBlobClient.url,
    etag: response.etag,
    size: content.length,
  };
}

/**
 * Exclui um blob do Azure Blob Storage
 */
export async function deleteBlob(blobName: string, customContainerName?: string): Promise<boolean> {
  const { containerClient } = await getContainerClient(customContainerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const result = await blockBlobClient.deleteIfExists();
  return result.succeeded;
}

/**
 * Testa a conexão com o Azure Blob Storage
 */
export async function testAzureConnection(customContainerName?: string) {
  try {
    const { containerClient, containerName } = await getContainerClient(customContainerName);
    const exists = await containerClient.exists();
    
    let blobCount = 0;
    if (exists) {
      for await (const _ of containerClient.listBlobsFlat()) {
        blobCount++;
      }
    }

    return {
      connected: true,
      containerName,
      blobCount,
    };
  } catch (error: any) {
    return {
      connected: false,
      containerName: normalizeContainerName(customContainerName),
      error: error.message || 'Falha ao conectar ao Azure Blob Storage',
    };
  }
}
