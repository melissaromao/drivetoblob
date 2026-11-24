import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  CheckSquare,
  Square,
  ArrowRight,
  Upload,
  RefreshCw,
  Search,
  FolderOpen,
  Folder
} from 'lucide-react';
import { DriveFile } from '@/lib/types';

interface DriveFilesListProps {
  files: DriveFile[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMigrateSingle: (file: DriveFile) => void;
  onRefresh: () => void;
  onUploadTestFile: (file: globalThis.File) => Promise<void>;
  isDemoMode?: boolean;
}

export const DriveFilesList: React.FC<DriveFilesListProps> = ({
  files,
  loading,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onMigrateSingle,
  onRefresh,
  onUploadTestFile,
  isDemoMode,
}) => {
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every((f) => selectedIds.includes(f.id));

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUploadTestFile(file);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const getFileIcon = (mimeType: string, isFolder?: boolean) => {
    if (isFolder) return <Folder className="w-5 h-5 text-amber-400" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-rose-400" />;
    if (mimeType.includes('sheet') || mimeType.includes('csv') || mimeType.includes('excel'))
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (mimeType.includes('image')) return <FileImage className="w-5 h-5 text-sky-400" />;
    if (mimeType.includes('word') || mimeType.includes('document'))
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
              <FolderOpen className="w-5 h-5 text-emerald-400" />
              Arquivos de Origem (Google Drive)
            </h2>
            {isDemoMode && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Demo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pasta monitorada ({files.length} {files.length === 1 ? 'arquivo' : 'arquivos'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Upload file for testing */}
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/70 hover:bg-slate-700 text-slate-200 border border-slate-600/70 transition-all">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>{uploading ? 'Enviando...' : 'Adicionar Arquivo'}</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={uploading}
            />
          </label>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
            title="Atualizar lista de arquivos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Selection Controls */}
      <div className="pt-3 pb-2 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar arquivos de origem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/50 border border-slate-700/60"
        >
          {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5" />}
          {allSelected ? 'Desmarcar' : 'Selecionar Todos'}
        </button>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1 max-h-[420px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
            <p className="text-xs">Carregando arquivos do Google Drive...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-slate-400 border border-dashed border-slate-700/70 rounded-xl">
            <FolderOpen className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <p className="text-xs font-medium text-slate-300">Nenhum arquivo encontrado</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {search ? 'Tente outro termo de busca' : 'Clique em "Adicionar Arquivo" para criar um arquivo de teste'}
            </p>
          </div>
        ) : (
          filtered.map((file) => {
            const isSelected = selectedIds.includes(file.id);
            return (
              <div
                key={file.id}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleSelect(file.id)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex-shrink-0">
                    {getFileIcon(file.mimeType, file.isFolder)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-200 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{file.sizeFormatted}</span>
                      <span>•</span>
                      <span>
                        {file.modifiedTime
                          ? new Date(file.modifiedTime).toLocaleDateString('pt-BR')
                          : 'Recentemente'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-3 flex-shrink-0">
                  <button
                    onClick={() => onMigrateSingle(file)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all opacity-90 group-hover:opacity-100"
                    title={`Migrar ${file.name} para Azure Blob`}
                  >
                    <span>Migrar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
