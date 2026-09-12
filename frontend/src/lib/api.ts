export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

type ApiResponse<T> = { success: true; data: T } | { success: false; message: string; code: string };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, {
    credentials: "include",
    ...options,
    headers,
  });

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!json) {
    throw new ApiError("Unexpected server response", "BAD_RESPONSE", res.status);
  }
  if (!json.success) {
    throw new ApiError(json.message || "Request failed", json.code || "ERROR", res.status);
  }
  return json.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, file: File, fields?: Record<string, string>) => {
    const form = new FormData();
    form.append("file", file);
    if (fields) {
      for (const [key, value] of Object.entries(fields)) form.append(key, value);
    }
    return request<T>(path, { method: "POST", body: form });
  },
};
