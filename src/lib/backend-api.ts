import { ENV } from '@/env';

interface BackendRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  admin?: boolean;
  adminToken?: string;
  cache?: RequestCache;
}

function toPath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

export function getBackendUrl(path: string) {
  return `${ENV.apiBaseUrl}${toPath(path)}`;
}

export async function backendRequest<T = unknown>(
  path: string,
  options: BackendRequestOptions = {}
) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const isFormDataBody =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (options.body !== undefined && !isFormDataBody) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.admin) {
    if (!options.adminToken) {
      throw new Error('Admin oturumu gerekli.');
    }

    headers.Authorization = `Bearer ${options.adminToken}`;
  }

  const url = getBackendUrl(path);
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body:
      options.body === undefined
        ? undefined
        : isFormDataBody
          ? (options.body as FormData)
          : JSON.stringify(options.body),
    cache: options.cache || 'no-store',
  });

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    const preview = text.slice(0, 200).replace(/\n/g, ' ');
    throw new Error(
      `Invalid JSON from ${url}: ${preview}... (Status: ${response.status})`
    );
  }

  if (!response.ok) {
    const errorMessage =
      (data && typeof data === 'object' && 'message' in data && data.message) ||
      (data && typeof data === 'object' && 'error' in data && data.error) ||
      (typeof data === 'string' ? data : `HTTP ${response.status}`);

    throw new Error(errorMessage as string);
  }

  return data as T;
}
