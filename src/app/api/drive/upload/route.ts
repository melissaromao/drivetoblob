import { NextRequest, NextResponse } from 'next/server';
import { addDemoFile } from '@/lib/google-drive';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const created = addDemoFile(file.name, buffer, file.type || 'application/octet-stream');

    return NextResponse.json({
      success: true,
      file: created,
    });
  } catch (error: any) {
    console.error('[API /api/drive/upload] Erro:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao adicionar arquivo para migração',
      },
      { status: 500 }
    );
  }
}
