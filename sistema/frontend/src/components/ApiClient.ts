const DEFAULT_BASE = "http://localhost:3000";
const API_BASE = (import.meta.env.VITE_API_BASE as string) || DEFAULT_BASE;

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(
    `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    init,
  );
  const text = await res.text();
  if (!text) return { ok: res.ok, status: res.status };
  try {
    const data = JSON.parse(text) as T;
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    return { ok: res.ok, status: res.status, error: "Invalid JSON response" };
  }
}

export const ApiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export default ApiClient;
