import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/mongodb";

type RouteContext = { params: Promise<Record<string, string>> };
type ApiHandler = (request: NextRequest, context: RouteContext) => Promise<NextResponse>;

export function withDB(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context: RouteContext) => {
    await connectDB();
    return handler(request, context);
  };
}
