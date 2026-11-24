import { NextResponse } from 'next/server';
import { testAzureConnection } from '@/lib/azure-blob';
import { testGoogleDriveConnection } from '@/lib/google-drive';

export async function GET() {
  try {
    const [azure, googleDrive] = await Promise.all([
      testAzureConnection(),
      testGoogleDriveConnection(),
    ]);

    return NextResponse.json({
      success: true,
      services: {
        azure,
        googleDrive,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API /api/status] Erro:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao consultar status dos serviços',
      },
      { status: 500 }
    );
  }
}
