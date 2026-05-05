export type Device = {
  deviceId: string;
  name: string;
  token: string;
};

export type AuthResponse = {
  token: string;
  expiresIn: number;
};

export type DevicesResponse = {
  devices: Device[];
};

export type RegenerateResponse = {
  deviceId: string;
  name: string;
  token: string;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "Something went wrong");
  }

  return data as T;
}

export function login(email: string, password: string) {
  return apiFetch<{ ok: true }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signup(values: {
  username: string;
  email: string;
  name: string;
  surname: string;
  password: string;
}) {
  return apiFetch<{ ok: true }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function logout() {
  return apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
}

export function getDevices() {
  return apiFetch<DevicesResponse>("/api/proxy/users/devices");
}

export function addDevice(name: string) {
  return apiFetch<DevicesResponse>("/api/proxy/users/devices", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function regenerateDeviceToken(deviceId: string) {
  return apiFetch<RegenerateResponse>(`/api/proxy/users/devices/${deviceId}/regenerate-token`, {
    method: "POST",
  });
}
