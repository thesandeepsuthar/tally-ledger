import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/api-handler";
import { Account } from "@/db/models/Account";

export const GET = withDB(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");

  const filter: Record<string, any> = { is_active: true };
  if (type) {
    filter.type = type;
  }

  const accounts = await Account.find(filter).sort({ code: 1 });
  return NextResponse.json(accounts);
});

export const POST = withDB(async (request: NextRequest) => {
  const body = await request.json();
  const account = await Account.create(body);
  return NextResponse.json(account, { status: 201 });
});
