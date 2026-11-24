import React from 'react';
import { ArrowRightLeft, Settings, Play, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  selectedCount: number;
  totalDriveCount: number;
  isMigrating: boolean;
  onMigrateSelected: () => void;
  onMigrateAll: () => void;
  onRefreshAll: () => void;
  onOpenSettings: () => void;
  refreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCount,
  totalDriveCount,
  isMigrating,
  onMigrateSelected,
  onMigrateAll,
  onRefreshAll,
  onOpenSettings,
  refreshing,
}) => {
  return (
    <header className="bg-black sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  DriveToBlob <span className="text-zinc-400 font-medium">Migration Hub</span>
                </h1>
                <span className="text-[10px] bg-zinc-900 text-white font-semibold px-2 py-0.5 rounded">
                  Fullstack Next.js
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Migração automatizada e segura do Google Drive para Azure Blob Storage
              </p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Card: Painel de Controle */}
            <div className="flex items-center gap-1.5 rounded-lg p-1">
              <button
                onClick={onRefreshAll}
                disabled={refreshing || isMigrating}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
                title="Recarregar dados do Google Drive e Azure Blob"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
                <span>Recarregar</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer"
                title="Ver configurações e credenciais"
              >
                <Settings className="w-3.5 h-3.5 text-white" />
                <span>Configurações</span>
              </button>
            </div>

            {/* Card: Ações de Migração */}
            <div className="flex items-center gap-1.5 rounded-lg p-1">
              <button
                onClick={onMigrateSelected}
                disabled={selectedCount === 0 || isMigrating}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Migrar apenas os arquivos selecionados no Google Drive"
              >
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                <span>
                  {isMigrating
                    ? 'Migrando...'
                    : selectedCount > 0
                    ? `Migrar Selecionados (${selectedCount})`
                    : 'Migrar Seleção'}
                </span>
              </button>

              <button
                onClick={onMigrateAll}
                disabled={totalDriveCount === 0 || isMigrating}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Migrar todos os arquivos da pasta do Google Drive"
              >
                <Layers className="w-3.5 h-3.5 text-white" />
                <span>Migrar Todos ({totalDriveCount})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
