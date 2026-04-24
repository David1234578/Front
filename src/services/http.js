import { appConfig } from '../config';

const joinUrl = (baseUrl, path) => {
  const normalizedBase = String(baseUrl ?? '').replace(/\/$/, '');
  const normalizedPath = String(path ?? '').replace(/^\//, '');
  return `${normalizedBase}/${normalizedPath}`;
};

export function buildApiUrl(path) {
  return joinUrl(appConfig.apiBaseUrl, path);
}

export async function requestJson(path, options = {}) {
  if (!appConfig.useRemoteApi) {
    throw new Error('La API remota está deshabilitada en este entorno.');
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), appConfig.apiTimeoutMs);
  const { body, headers, signal, token, ...restOptions } = options;

  try {
    const response = await fetch(buildApiUrl(path), {
      ...restOptions,
      body: body ? JSON.stringify(body) : undefined,
      credentials: restOptions.credentials ?? 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      signal: signal ?? controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message ?? 'La solicitud al backend no se pudo completar.');
    }

    return data;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
