import React, { useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface MigrationConsoleProps {
  logs: string[];
  isMigrating: boolean;
  onClearLogs: () => void;
  successCount: number;
  errorCount: number;
}

export const MigrationConsole: React.FC<MigrationConsoleProps> = ({
  logs,
  isMigrating,
  onClearLogs,
  successCount,
  errorCount,
}) => {
  const consoleBottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogStyle = (log: string) => {
    if (log.includes('❌') || log.includes('[ERRO]')) {
      return 'text-rose-400 font-medium';
    }
    if (log.includes('✅') || log.includes('[SUCESSO]')) {
      return 'text-emerald-400 font-medium';
    }
    if (log.includes('🚀') || log.includes('🏁') || log.includes('====')) {
      return 'text-indigo-400 font-semibold';
    }
    if (log.includes('⏳') || log.includes('[INICIANDO')) {
      return 'text-amber-300';
    }
    return 'text-slate-300';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
      {/* Console Header */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Console de Migração em Tempo Real (Status de Transferência)</span>
            {isMigrating && (
              <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold animate-pulse ml-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                Transferindo...
              </span>
            )}
          </div>
        </div>

        {/* Console Stats & Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
              <CheckCircle2 className="w-3 h-3" /> {successCount}
            </span>
            <span className="flex items-center gap-1 text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
              <XCircle className="w-3 h-3" /> {errorCount}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors p-1"
            title="Copiar logs"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors p-1"
            title="Limpar console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 font-mono text-xs overflow-y-auto max-h-64 min-h-36 bg-slate-950/90 space-y-1">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic py-6 text-center">
            Aguardando início de transferência. Os status detalhados de sucesso/erro de cada arquivo aparecerão aqui e no terminal do servidor.
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`leading-relaxed whitespace-pre-wrap ${getLogStyle(log)}`}>
              {log}
            </div>
          ))
        )}
        <div ref={consoleBottomRef} />
      </div>

      {copied && (
        <div className="bg-emerald-900/80 text-emerald-200 text-xs text-center py-1 font-mono">
          Logs copiados para a área de transferência!
        </div>
      )}
    </div>
  );
};
