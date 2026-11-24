import React from 'react';
import { X, Key, ShieldCheck, HardDrive, Cloud, AlertCircle } from 'lucide-react';
import { ServiceStatus } from '@/lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ServiceStatus | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  status,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Configurações e Credenciais (.env.local)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {/* Azure Blob Section */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sky-400 font-semibold mb-2">
              <Cloud className="w-4 h-4" />
              <span>Azure Blob Storage</span>
            </div>
            <div className="space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-400">Account Name:</span>{' '}
                <span className="text-sky-300">stop2nuvem2</span>
              </div>
              <div>
                <span className="text-slate-400">Contêiner Configurado:</span>{' '}
                <span className="text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 font-bold">
                  {status?.azure.containerName || 'aluno-melissa'} (Aluno_Melissa)
                </span>
              </div>
              <div>
                <span className="text-slate-400">Status de Conexão:</span>{' '}
                <span className={status?.azure.connected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {status?.azure.connected ? 'Ativo e Autenticado via Connection String' : 'Erro de conexão'}
                </span>
              </div>
            </div>
          </div>

          {/* Google Drive Section */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
              <HardDrive className="w-4 h-4" />
              <span>Google Drive (Service Account)</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Para sincronizar com uma pasta real do Google Drive, adicione as credenciais da Service Account no arquivo <code className="text-indigo-300 font-mono">.env.local</code>:
            </p>
            <div className="bg-slate-950/90 rounded-lg p-3 font-mono text-[11px] text-slate-300 space-y-1 border border-slate-800">
              <p><span className="text-indigo-400">GOOGLE_CLIENT_EMAIL</span>="service-account@projeto.iam.gserviceaccount.com"</p>
              <p><span className="text-indigo-400">GOOGLE_PRIVATE_KEY</span>="-----BEGIN PRIVATE KEY-----\n..."</p>
              <p><span className="text-indigo-400">GOOGLE_DRIVE_FOLDER_ID</span>="id-da-sua-pasta-no-drive"</p>
            </div>
            <div className="mt-3 flex items-start gap-2 text-[11px] text-amber-300/90 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/40">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Modo Demonstração:</strong> Caso ainda não tenha as chaves do Google Service Account, o sistema fornece arquivos simulados realistas e permite carregar novos arquivos pela interface para testar a migração real para o Azure Blob Storage.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
