import { NextResponse } from "next/server";
import db from "@/db/knex";

export async function GET() {
  try {
    await db.raw("SELECT 1");
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    return NextResponse.json(
      { status: "error", database: "disconnected", error: String(error) },
      { status: 500 }
    );
  }
}
