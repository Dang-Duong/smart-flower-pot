import { NextRequest, NextResponse } from "next/server";
import { setToken } from "@/lib/auth-server";

const API_BASE = process.env.API_BASE_URL;

export async function POST(req: NextRequest) {
  if (!API_BASE) {
    return NextResponse.json({ error: "API_BASE_URL is not configured" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let beRes: Response;
  try {
    beRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the backend. Is it running?" }, { status: 502 });
  }

  const data = await beRes.json().catch(() => ({}));

  if (!beRes.ok) {
    return NextResponse.json(data, { status: beRes.status });
  }

  await setToken(data.token, data.expiresIn);
  return NextResponse.json({ ok: true });
}
