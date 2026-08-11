import { NextResponse } from "next/server";
import { clearServerSession } from "@/lib/auth/session";

export async function POST() {
  await clearServerSession();
  return NextResponse.json({ ok: true });
}