import { NextRequest, NextResponse } from 'next/server';
import { AdminSessionError, requireAdminAccessToken } from '@/lib/admin-auth';
import { backendRequest } from '@/lib/backend-api';
import {
  mapBackendFieldTemplateToFrontend,
  mapFrontendFieldToBackendPayload,
} from '@/lib/backend-mappers';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminToken = await requireAdminAccessToken();
    const body = await request.json();
    const data = await backendRequest(`/admin/field-templates/${id}`, {
      method: 'PUT',
      body: mapFrontendFieldToBackendPayload(body),
      admin: true,
      adminToken,
    });

    return NextResponse.json({
      success: true,
      data: mapBackendFieldTemplateToFrontend(unwrapBackendData(data)),
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
    await backendRequest(`/admin/field-templates/${id}`, {
      method: 'DELETE',
      admin: true,
      adminToken,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
