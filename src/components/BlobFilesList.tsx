import React, { useState } from 'react';
import {
  Cloud,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { BlobFile } from '@/lib/types';

interface BlobFilesListProps {
  blobs: BlobFile[];
  loading: boolean;
  containerName: string;
  onRefresh: () => void;
  onDeleteBlob: (name: string) => Promise<void>;
}

export const BlobFilesList: React.FC<BlobFilesListProps> = ({
  blobs,
  loading,
  containerName,
  onRefresh,
  onDeleteBlob,
}) => {
  const [search, setSearch] = useState('');
  const [deletingBlob, setDeletingBlob] = useState<string | null>(null);

  const filtered = blobs.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (name: string) => {
    if (!confirm(`Deseja realmente excluir o blob "${name}" do contêiner Azure?`)) {
      return;
    }
    setDeletingBlob(name);
    try {
      await onDeleteBlob(name);
    } finally {
      setDeletingBlob(null);
    }
  };

  const getFileIcon = (contentType?: string, name?: string) => {
    const ext = name?.split('.').pop()?.toLowerCase() || '';
    if (contentType?.includes('pdf') || ext === 'pdf')
      return <FileText className="w-5 h-5 text-rose-400" />;
    if (contentType?.includes('sheet') || contentType?.includes('csv') || ext === 'xlsx' || ext === 'csv')
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (contentType?.includes('image') || ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext))
      return <FileImage className="w-5 h-5 text-sky-400" />;
    if (contentType?.includes('word') || ext === 'docx')
      return <FileText className="w-5 h-5 text-blue-400" />;
    return <File className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-sky-400" />
              Arquivos de Destino (Azure Blob Storage)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Contêiner:{' '}
            <span className="font-mono text-sky-300 font-medium">{containerName}</span> ({blobs.length}{' '}
            {blobs.length === 1 ? 'arquivo' : 'arquivos'})
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
          title="Atualizar lista de blobs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="pt-3 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar arquivos no Azure Blob..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Blobs List */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1 max-h-[420px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mb-2" />
            <p className="text-xs">Consultando contêiner Azure Blob Storage...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-slate-400 border border-dashed border-slate-700/70 rounded-xl">
            <Cloud className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <p className="text-xs font-medium text-slate-300">Contêiner vazio</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Selecione arquivos do Google Drive ao lado e execute a migração
            </p>
          </div>
        ) : (
          filtered.map((blob) => (
            <div
              key={blob.name}
              className="group flex items-center justify-between p-3 rounded-xl border bg-slate-900/60 border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  {getFileIcon(blob.contentType, blob.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-200 truncate" title={blob.name}>
                      {blob.name}
                    </p>
                    <span className="inline-flex items-center text-[10px] text-emerald-400" title="Armazenado no Azure">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{blob.sizeFormatted}</span>
                    <span>•</span>
                    <span>
                      {blob.lastModified
                        ? new Date(blob.lastModified).toLocaleDateString('pt-BR')
                        : 'Recente'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-3 flex items-center gap-1 flex-shrink-0">
                <a
                  href={blob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Abrir URL do Blob"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => handleDelete(blob.name)}
                  disabled={deletingBlob === blob.name}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Excluir Blob"
                >
                  <Trash2 className={`w-4 h-4 ${deletingBlob === blob.name ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
