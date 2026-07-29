import { NextRequest, NextResponse } from "next/server";
import db from "@/db/knex";
import { InventoryService } from "@/services/inventoryService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    const revenueQuery = db("ledger_entries as le")
      .join("accounts as a", "le.account_id", "a.id")
      .join("transactions as t", "le.transaction_id", "t.id")
      .where("a.type", "revenue")
      .where("le.entry_type", "credit")
      .sum("le.amount as total");

    if (start_date) {
      revenueQuery.where("t.transaction_date", ">=", new Date(start_date));
    }
    if (end_date) {
      revenueQuery.where("t.transaction_date", "<=", new Date(end_date));
    }

    const [revenueResult] = await revenueQuery;
    const totalRevenue = parseFloat(revenueResult?.total || "0");

    const receivablesQuery = db("ledger_entries as le")
      .join("accounts as a", "le.account_id", "a.id")
      .where("a.code", "LIKE", "1200%")
      .select(
        db.raw(
          "SUM(CASE WHEN le.entry_type = 'debit' THEN le.amount ELSE -le.amount END) as balance"
        )
      );

    const [receivablesResult] = await receivablesQuery;
    const outstandingReceivables = parseFloat(receivablesResult?.balance || "0");

    const payablesQuery = db("ledger_entries as le")
      .join("accounts as a", "le.account_id", "a.id")
      .where("a.code", "LIKE", "2100%")
      .select(
        db.raw(
          "SUM(CASE WHEN le.entry_type = 'credit' THEN le.amount ELSE -le.amount END) as balance"
        )
      );

    const [payablesResult] = await payablesQuery;
    const outstandingPayables = parseFloat(payablesResult?.balance || "0");

    const lowStockItems = await InventoryService.getLowStockItems();

    const inventoryValue = await db("inventory_items")
      .where("is_active", true)
      .select(db.raw("SUM(quantity * cost_price) as total_value"))
      .first();

    return NextResponse.json({
      financial_summary: {
        total_revenue: totalRevenue,
        outstanding_receivables: outstandingReceivables,
        outstanding_payables: outstandingPayables,
        inventory_value: parseFloat(inventoryValue?.total_value || "0"),
      },
      inventory_alerts: {
        low_stock_items: lowStockItems.map((item) => ({
          id: item.id,
          sku: item.sku,
          name: item.name,
          current_quantity: item.quantity,
          reorder_level: item.reorder_level,
        })),
        total_low_stock_items: lowStockItems.length,
      },
      generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
