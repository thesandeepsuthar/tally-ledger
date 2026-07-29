import { NextRequest, NextResponse } from "next/server";
import db from "@/db/knex";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    let query = db("accounts").select("*").where("is_active", true).orderBy("code");

    if (type) {
      query = query.where("type", type);
    }

    const accounts = await query;
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [account] = await db("accounts").insert(body).returning("*");
    return NextResponse.json(account, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
