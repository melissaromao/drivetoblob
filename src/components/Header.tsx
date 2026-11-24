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
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                  DriveToBlob <span className="text-indigo-400 font-medium">Migration Hub</span>
                </h1>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Fullstack Next.js
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Migração automatizada e segura do Google Drive para Azure Blob Storage
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={onRefreshAll}
              disabled={refreshing || isMigrating}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-all disabled:opacity-50"
              title="Recarregar dados de origem e destino"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Recarregar</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-all"
              title="Ver configurações e credenciais"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Configurações</span>
            </button>

            {/* Migrate Selected */}
            <button
              onClick={onMigrateSelected}
              disabled={selectedCount === 0 || isMigrating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {isMigrating
                  ? 'Migrando...'
                  : selectedCount > 0
                  ? `Migrar Selecionados (${selectedCount})`
                  : 'Selecione Arquivos'}
              </span>
            </button>

            {/* Migrate All */}
            <button
              onClick={onMigrateAll}
              disabled={totalDriveCount === 0 || isMigrating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-md shadow-indigo-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Migrar Todos ({totalDriveCount})</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
