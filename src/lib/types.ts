export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  sizeFormatted: string;
  modifiedTime?: string;
  webViewLink?: string;
  isFolder?: boolean;
}

export interface BlobFile {
  name: string;
  size: number;
  sizeFormatted: string;
  lastModified?: string;
  contentType?: string;
  url: string;
  etag?: string;
}

export interface MigrationResult {
  fileId: string;
  fileName: string;
  blobName: string;
  size: number;
  status: 'success' | 'error' | 'skipped';
  message?: string;
  transferredAt: string;
  durationMs: number;
}

export interface MigrationSummary {
  total: number;
  successful: number;
  failed: number;
  totalBytes: number;
  results: MigrationResult[];
  logs: string[];
}

export interface ServiceStatus {
  azure: {
    connected: boolean;
    containerName: string;
    blobCount?: number;
    error?: string;
  };
  googleDrive: {
    connected: boolean;
    folderId?: string;
    folderName?: string;
    fileCount?: number;
    configured: boolean;
    error?: string;
    isDemoMode?: boolean;
  };
}
