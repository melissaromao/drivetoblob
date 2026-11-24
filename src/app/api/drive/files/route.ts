import { NextRequest, NextResponse } from 'next/server';
import { listSourceFiles } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId') || undefined;

    const { files, isDemo } = await listSourceFiles(folderId);

    return NextResponse.json({
      success: true,
      files,
      count: files.length,
      isDemo,
      folderId: folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || null,
    });
  } catch (error: any) {
    console.error('[API /api/drive/files] Erro:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao listar arquivos do Google Drive',
      },
      { status: 500 }
    );
  }
}
