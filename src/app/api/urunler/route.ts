import { NextResponse } from 'next/server';
import { backendRequest } from '@/lib/backend-api';
import { mapBackendProductListToFrontend } from '@/lib/backend-mappers';

export async function GET() {
  try {
    const data = await backendRequest('/products');

    return NextResponse.json({
      success: true,
      data: mapBackendProductListToFrontend(data),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
