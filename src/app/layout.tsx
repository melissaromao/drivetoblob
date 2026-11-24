import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DriveToBlob | Migração Google Drive para Azure Blob Storage",
  description: "Aplicação Fullstack para migração segura de arquivos do Google Drive para Azure Blob Storage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
