import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth-server";

const API_BASE = process.env.API_BASE_URL;

type RouteParams = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, { params }: RouteParams) {
  if (!API_BASE) {
    return NextResponse.json({ error: "API_BASE_URL is not configured" }, { status: 500 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await params;
  const url = new URL(`${API_BASE}/api/${path.join("/")}`);
  req.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

  let beRes: Response;
  try {
    beRes = await fetch(url.toString(), { method: req.method, headers, body });
  } catch {
    return NextResponse.json({ error: "Could not reach the backend. Is it running?" }, { status: 502 });
  }

  const data = await beRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: beRes.status });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE };
