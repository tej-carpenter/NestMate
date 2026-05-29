import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", service: "nestmate", timestamp: new Date().toISOString() });
}