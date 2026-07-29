import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/api-handler";
import { Transaction } from "@/db/models/Transaction";

export const GET = withDB(async () => {
  const transactions = await Transaction.find().sort({ transaction_date: -1 });
  return NextResponse.json(transactions);
});

export const POST = withDB(async (request: NextRequest) => {
  const body = await request.json();
  const transaction = await Transaction.create(body);
  return NextResponse.json(transaction, { status: 201 });
});
