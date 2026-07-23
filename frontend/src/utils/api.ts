import { API_URL } from '../context/AuthContext';

function getAuthHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function apiGet<T = any>(path: string, token: string | null): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse<T>(res, path);
}

export async function apiPost<T = any>(path: string, body: any, token: string | null): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, path);
}

export async function apiPut<T = any>(path: string, body: any, token: string | null): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, path);
}

export async function apiDelete<T = any>(path: string, token: string | null): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  return handleResponse<T>(res, path);
}

export async function apiUpload<T = any>(path: string, formData: FormData, token: string | null): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse<T>(res, path);
}

async function handleResponse<T>(res: Response, path: string): Promise<T> {
  const text = await res.text();
  let data: any = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }

  if (!data && !res.ok) {
    throw new Error(`Server error ${res.status} on ${path}. Make sure VITE_API_URL env var is set to your backend URL.`);
  }
  if (!data && res.ok) {
    throw new Error(`Empty response from server on ${path}. Make sure VITE_API_URL env var is set to your backend URL.`);
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.errors?.[0]?.message || `Request failed (${res.status})`);
  }

  return data as T;
}
