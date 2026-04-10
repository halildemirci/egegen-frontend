import { NextRequest, NextResponse } from 'next/server';
import { AdminSessionError, requireAdminAccessToken } from '@/lib/admin-auth';
import { backendRequest } from '@/lib/backend-api';
import { mapBackendProductToFrontend } from '@/lib/backend-mappers';

function unwrapBackendData(payload: unknown) {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: unknown }).data;
  }

  return payload;
}

function toErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = error instanceof AdminSessionError ? 401 : 500;

  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminToken = await requireAdminAccessToken();
    const data = await backendRequest(`/admin/products/${id}`, {
      admin: true,
      adminToken,
    });

    return NextResponse.json({
      success: true,
      data: mapBackendProductToFrontend(unwrapBackendData(data)),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminToken = await requireAdminAccessToken();
    const formData = await request.formData();
    const data = await backendRequest(`/admin/products/${id}`, {
      method: 'PUT',
      body: formData,
      admin: true,
      adminToken,
    });

    return NextResponse.json({
      success: true,
      data: mapBackendProductToFrontend(unwrapBackendData(data)),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminToken = await requireAdminAccessToken();
    await backendRequest(`/admin/products/${id}`, {
      method: 'DELETE',
      admin: true,
      adminToken,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
