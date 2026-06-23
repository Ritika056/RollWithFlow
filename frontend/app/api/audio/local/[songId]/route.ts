import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ songId: string }> }) {
  const { songId } = await params;
  if (!/^\d+$/.test(songId)) return NextResponse.json({ detail: "Invalid song id" }, { status: 400 });
  const token = (await cookies()).get("rwf_token")?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const range = request.headers.get("range");
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";
  const response = await fetch(`${backendUrl}/api/audio/local/${songId}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...(range ? { Range: range } : {}) },
  });
  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "content-disposition"]) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new NextResponse(response.body, { status: response.status, headers });
}
