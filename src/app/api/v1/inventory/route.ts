import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/api-handler";
import { InventoryItem } from "@/db/models/InventoryItem";

export const GET = withDB(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const low_stock = searchParams.get("low_stock");

  const filter: Record<string, any> = { is_active: true };

  if (low_stock === "true") {
    filter.$expr = { $lte: ["$quantity", { $ifNull: ["$reorder_level", 0] }] };
  }

  const items = await InventoryItem.find(filter).sort({ sku: 1 });
  return NextResponse.json(items);
});

export const POST = withDB(async (request: NextRequest) => {
  const body = await request.json();
  const item = await InventoryItem.create(body);
  return NextResponse.json(item, { status: 201 });
});
