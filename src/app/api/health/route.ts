import { NextResponse } from "next/server";
import { withDB } from "@/lib/api-handler";

export const GET = withDB(async () => {
  const mongoose = (await import("mongoose")).default;
  const state = mongoose.connection.readyState;
  return NextResponse.json({ status: "ok", database: state === 1 ? "connected" : "disconnected" });
});
