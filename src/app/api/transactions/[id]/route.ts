import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/api-handler";
import { Transaction } from "@/db/models/Transaction";

export const GET = withDB(async (request: NextRequest, { params }) => {
  const { id } = await params;
  const transaction = await Transaction.findById(id);

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json(transaction);
});

export const PUT = withDB(async (request: NextRequest, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const transaction = await Transaction.findByIdAndUpdate(id, body, { new: true });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json(transaction);
});

export const DELETE = withDB(async (request: NextRequest, { params }) => {
  const { id } = await params;
  const result = await Transaction.findByIdAndDelete(id);

  if (!result) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Transaction deleted" });
});
