import { NextResponse } from "next/server";
import { clearToken, getToken } from "@/lib/auth-server";

const API_BASE = process.env.API_BASE_URL;

export async function POST() {
  const token = await getToken();

  if (token && API_BASE) {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  await clearToken();
  return NextResponse.json({ ok: true });
}
