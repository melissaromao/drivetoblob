import { NextRequest, NextResponse } from 'next/server';
import { listDestinationBlobs, deleteBlob } from '@/lib/azure-blob';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const container = searchParams.get('container') || undefined;

    const blobs = await listDestinationBlobs(container);

    return NextResponse.json({
      success: true,
      blobs,
      count: blobs.length,
      container: container || process.env.AZURE_STORAGE_CONTAINER_NAME || 'aluno-melissa',
    });
  } catch (error: any) {
    console.error('[API /api/blob/files] Erro:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao listar arquivos do Azure Blob Storage',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blobName = searchParams.get('name');
    const container = searchParams.get('container') || undefined;

    if (!blobName) {
      return NextResponse.json(
        { success: false, error: 'Parâmetro "name" é obrigatório.' },
        { status: 400 }
      );
    }

    const deleted = await deleteBlob(blobName, container);

    return NextResponse.json({
      success: true,
      deleted,
      blobName,
    });
  } catch (error: any) {
    console.error('[API /api/blob/files DELETE] Erro:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao excluir blob no Azure Blob Storage',
      },
      { status: 500 }
    );
  }
}
