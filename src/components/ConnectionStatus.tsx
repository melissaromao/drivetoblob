import React from 'react';
import { Cloud, HardDrive, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ServiceStatus } from '@/lib/types';

interface ConnectionStatusProps {
  status: ServiceStatus | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  loading,
  onRefresh,
  onOpenSettings,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Google Drive Status */}
      <div className="bg-zinc-950 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-100 text-sm">Origem: Google Drive</h3>
                {status?.googleDrive.connected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Service Account Ativa
                  </span>
                ) : status?.googleDrive.isDemoMode ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400">
                    <AlertTriangle className="w-3 h-3" /> Modo Demonstração
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="w-3 h-3" /> Não Configurado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {status?.googleDrive.connected
                  ? `Conectado com sucesso via Service Account (${status.googleDrive.fileCount ?? 0} arquivos disponíveis)`
                  : 'Arquivos simulados disponíveis para teste ou configure sua Service Account no .env.local'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Configurar
          </button>
        </div>
      </div>

      {/* Azure Blob Status */}
      <div className="bg-zinc-950 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-100 text-sm">Destino: Azure Blob Storage</h3>
                {status?.azure.connected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> Conectado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="w-3 h-3" /> Erro de Conexão
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Contêiner:{' '}
                <span className="font-mono text-sky-300 bg-slate-800 px-1.5 py-0.5 rounded">
                  {status?.azure.containerName || 'aluno-melissa'}
                </span>{' '}
                ({status?.azure.blobCount ?? 0} blobs armazenados)
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Atualizar conexões"
          >
            {loading ? 'Checando...' : 'Recarregar'}
          </button>
        </div>
      </div>
    </div>
  );
};
