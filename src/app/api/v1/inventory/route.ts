import { NextRequest, NextResponse } from "next/server";
import db from "@/db/knex";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const low_stock = searchParams.get("low_stock");

    let query = db("inventory_items").select("*").where("is_active", true);

    if (low_stock === "true") {
      query = query.whereRaw("quantity <= reorder_level");
    }

    const items = await query.orderBy("sku");
    return NextResponse.json(items);
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
    const [item] = await db("inventory_items").insert(body).returning("*");
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
