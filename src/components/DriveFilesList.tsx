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
    if (isFolder) return <Folder className="w-5 h-5 text-white" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-white" />;
    if (mimeType.includes('sheet') || mimeType.includes('csv') || mimeType.includes('excel'))
      return <FileSpreadsheet className="w-5 h-5 text-white" />;
    if (mimeType.includes('image')) return <FileImage className="w-5 h-5 text-white" />;
    if (mimeType.includes('word') || mimeType.includes('document'))
      return <FileText className="w-5 h-5 text-white" />;
    return <File className="w-5 h-5 text-white" />;
  };

  return (
    <div className="bg-zinc-950 rounded-xl p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-white" />
              Arquivos de Origem (Google Drive)
            </h2>
            {isDemoMode && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                Demo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pasta monitorada ({files.length} {files.length === 1 ? 'arquivo' : 'arquivos'})
          </p>
        </div>

        {/* Actions bar: Upload & Refresh */}
        <div className="flex items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
            <Upload className="w-3.5 h-3.5 text-white" />
            <span>{uploading ? 'Enviando...' : 'Adicionar Arquivo'}</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={uploading}
            />
          </label>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Atualizar lista de arquivos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Selection Controls Card */}
      <div className="pt-2 pb-2 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar arquivos de origem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <label className="inline-flex items-center gap-1.5 text-xs text-white cursor-pointer select-none bg-zinc-900 px-3 py-1.5 rounded-lg transition-colors" title="Selecionar ou desmarcar todos os arquivos filtrados">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => (allSelected ? onDeselectAll() : onSelectAll())}
            className="h-3.5 w-3.5 text-emerald-500 bg-slate-800 rounded cursor-pointer accent-emerald-500"
            aria-label="Selecionar todos os arquivos filtrados"
          />
          <span>{allSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}</span>
        </label>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1 max-h-[420px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
            <p className="text-xs">Carregando arquivos do Google Drive...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-slate-400 bg-slate-950/40 rounded-xl">
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
                className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-emerald-950/30'
                    : 'bg-black hover:bg-zinc-900'
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
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
