import { NextRequest, NextResponse } from 'next/server';
import { migrateFiles } from '@/lib/migration';

export async function POST(request: NextRequest) {
  try {
    let body: { fileIds?: string[]; containerName?: string; folderId?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Corpo vazio é aceito para migrar todos
    }

    const { fileIds, containerName, folderId } = body;

    const summary = await migrateFiles({
      fileIds,
      containerName,
      folderId,
    });

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('[API /api/migrate] Erro:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro durante o processo de migração',
      },
      { status: 500 }
    );
  }
}
