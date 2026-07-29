import { NextRequest, NextResponse } from "next/server";
import db from "@/db/knex";

export async function GET() {
  try {
    const transactions = await db("transactions").select("*").orderBy("transaction_date", "desc");
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [transaction] = await db("transactions").insert(body).returning("*");
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
