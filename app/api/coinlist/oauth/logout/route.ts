import { coinListServer } from "@/lib/coinlist-server";
import { NextResponse } from "next/server";

export async function POST() {
  await coinListServer().logout();
  return NextResponse.json({ ok: true });
}
