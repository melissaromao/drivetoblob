'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { DriveFilesList } from '@/components/DriveFilesList';
import { BlobFilesList } from '@/components/BlobFilesList';
import { MigrationConsole } from '@/components/MigrationConsole';
import { SettingsModal } from '@/components/SettingsModal';
import { DriveFile, BlobFile, ServiceStatus } from '@/lib/types';
import { ArrowRight, Sparkles, CheckCircle2, Cloud, HardDrive } from 'lucide-react';

export default function Home() {
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [blobFiles, setBlobFiles] = useState<BlobFile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);

  const [loadingDrive, setLoadingDrive] = useState(true);
  const [loadingBlob, setLoadingBlob] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const appendLogs = (newLogs: string[]) => {
    setLogs((prev) => [...prev, ...newLogs]);
  };

  const addSingleLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Carregar arquivos do Google Drive
  const loadDriveFiles = useCallback(async () => {
    setLoadingDrive(true);
    try {
      const res = await fetch('/api/drive/files');
      const data = await res.json();
      if (data.success) {
        setDriveFiles(data.files || []);
      } else {
        addSingleLog(`❌ Erro ao listar Google Drive: ${data.error}`);
      }
    } catch (err: any) {
      addSingleLog(`❌ Falha na requisição do Google Drive: ${err.message}`);
    } finally {
      setLoadingDrive(false);
    }
  }, []);

  // Carregar arquivos do Azure Blob Storage
  const loadBlobFiles = useCallback(async () => {
    setLoadingBlob(true);
    try {
      const res = await fetch('/api/blob/files');
      const data = await res.json();
      if (data.success) {
        setBlobFiles(data.blobs || []);
      } else {
        addSingleLog(`❌ Erro ao listar Azure Blob Storage: ${data.error}`);
      }
    } catch (err: any) {
      addSingleLog(`❌ Falha na requisição do Azure Blob: ${err.message}`);
    } finally {
      setLoadingBlob(false);
    }
  }, []);

  // Verificar status das conexões
  const checkStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data.success) {
        setServiceStatus(data.services);
      }
    } catch (err: any) {
      console.error('Erro ao verificar status:', err);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  // Inicialização
  useEffect(() => {
    loadDriveFiles();
    loadBlobFiles();
    checkStatus();
    addSingleLog('🌟 DriveToBlob inicializado. Pronto para operações de migração.');
  }, [loadDriveFiles, loadBlobFiles, checkStatus]);

  const handleRefreshAll = () => {
    loadDriveFiles();
    loadBlobFiles();
    checkStatus();
    addSingleLog('🔄 Atualizando dados de origem (Drive) e destino (Blob)...');
  };

  // Seleção de arquivos
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(driveFiles.map((f) => f.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  // Executar migração
  const executeMigration = async (fileIds?: string[]) => {
    setIsMigrating(true);
    const targetCount = fileIds ? fileIds.length : driveFiles.length;
    addSingleLog(`🚀 Iniciando migração de ${targetCount} arquivo(s)...`);

    try {
      const res = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds }),
      });

      const data = await res.json();

      if (data.success && data.summary) {
        appendLogs(data.summary.logs || []);
        setSuccessCount((prev) => prev + (data.summary.successful || 0));
        setErrorCount((prev) => prev + (data.summary.failed || 0));

        // Recarrega arquivos de destino
        await loadBlobFiles();
        await checkStatus();
      } else {
        addSingleLog(`❌ Falha na migração: ${data.error || 'Erro desconhecido'}`);
        setErrorCount((prev) => prev + targetCount);
      }
    } catch (err: any) {
      addSingleLog(`❌ Erro crítico de conexão na migração: ${err.message}`);
      setErrorCount((prev) => prev + targetCount);
    } finally {
      setIsMigrating(false);
    }
  };

  // Migrar arquivo individual
  const handleMigrateSingle = (file: DriveFile) => {
    executeMigration([file.id]);
  };

  // Migrar selecionados
  const handleMigrateSelected = () => {
    if (selectedIds.length === 0) return;
    executeMigration(selectedIds);
  };

  // Migrar todos
  const handleMigrateAll = () => {
    if (driveFiles.length === 0) return;
    executeMigration(driveFiles.map((f) => f.id));
  };

  // Excluir blob
  const handleDeleteBlob = async (name: string) => {
    try {
      const res = await fetch(`/api/blob/files?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        addSingleLog(`🗑️ Blob "${name}" excluído com sucesso do Azure.`);
        await loadBlobFiles();
        await checkStatus();
      } else {
        addSingleLog(`❌ Erro ao excluir blob "${name}": ${data.error}`);
      }
    } catch (err: any) {
      addSingleLog(`❌ Erro ao excluir blob: ${err.message}`);
    }
  };

  // Upload de arquivo de teste para origem
  const handleUploadTestFile = async (file: globalThis.File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        addSingleLog(`📥 Arquivo "${file.name}" adicionado à lista de origem do Drive.`);
        await loadDriveFiles();
      } else {
        addSingleLog(`❌ Falha ao carregar arquivo de teste: ${data.error}`);
      }
    } catch (err: any) {
      addSingleLog(`❌ Erro ao carregar arquivo de teste: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <Header
        selectedCount={selectedIds.length}
        totalDriveCount={driveFiles.length}
        isMigrating={isMigrating}
        onMigrateSelected={handleMigrateSelected}
        onMigrateAll={handleMigrateAll}
        onRefreshAll={handleRefreshAll}
        onOpenSettings={() => setIsSettingsOpen(true)}
        refreshing={loadingDrive || loadingBlob}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Connection Status Section */}
        <ConnectionStatus
          status={serviceStatus}
          loading={loadingStatus}
          onRefresh={checkStatus}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Quick Summary Pill Bar */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              Origem: <strong className="text-slate-200">{driveFiles.length} arquivos</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              Destino: <strong className="text-slate-200">{blobFiles.length} blobs</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Selecionados: <strong className="text-slate-200">{selectedIds.length}</strong>
            </span>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            Contêiner Azure: <span className="text-sky-300 font-semibold">{serviceStatus?.azure.containerName || 'aluno-melissa'}</span>
          </div>
        </div>

        {/* Dual Panel Grid (Origem ➔ Destino) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Origem: Google Drive */}
          <div className="flex flex-col">
            <DriveFilesList
              files={driveFiles}
              loading={loadingDrive}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onMigrateSingle={handleMigrateSingle}
              onRefresh={loadDriveFiles}
              onUploadTestFile={handleUploadTestFile}
              isDemoMode={serviceStatus?.googleDrive.isDemoMode}
            />
          </div>

          {/* Destino: Azure Blob Storage */}
          <div className="flex flex-col">
            <BlobFilesList
              blobs={blobFiles}
              loading={loadingBlob}
              containerName={serviceStatus?.azure.containerName || 'aluno-melissa'}
              onRefresh={loadBlobFiles}
              onDeleteBlob={handleDeleteBlob}
            />
          </div>
        </div>

        {/* Real-time Migration Console */}
        <MigrationConsole
          logs={logs}
          isMigrating={isMigrating}
          onClearLogs={() => setLogs([])}
          successCount={successCount}
          errorCount={errorCount}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>
          DriveToBlob Migration Hub • Projeto de Migração de Dados em Nuvem (Google Drive ➔ Azure Blob Storage)
        </p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={serviceStatus}
      />
    </div>
  );
}
