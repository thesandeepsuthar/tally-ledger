import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/lib/api-handler";
import { LedgerEntry } from "@/db/models/LedgerEntry";
import { Account } from "@/db/models/Account";
import { Transaction } from "@/db/models/Transaction";
import { InventoryItem } from "@/db/models/InventoryItem";
import { InventoryService } from "@/services/inventoryService";

export const GET = withDB(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");

  const accCol = Account.collection.name;
  const transCol = Transaction.collection.name;

  const dateMatch: any = {};
  if (start_date) dateMatch.$gte = new Date(start_date);
  if (end_date) dateMatch.$lte = new Date(end_date);

  const revenueResult = await LedgerEntry.aggregate([
    {
      $lookup: {
        from: accCol,
        localField: "account_id",
        foreignField: "_id",
        as: "account",
      },
    },
    { $unwind: "$account" },
    {
      $lookup: {
        from: transCol,
        localField: "transaction_id",
        foreignField: "_id",
        as: "transaction",
      },
    },
    { $unwind: "$transaction" },
    {
      $match: {
        "account.type": "revenue",
        entry_type: "credit",
        ...(start_date || end_date ? { "transaction.transaction_date": dateMatch } : {}),
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  const receivablesResult = await LedgerEntry.aggregate([
    {
      $lookup: {
        from: accCol,
        localField: "account_id",
        foreignField: "_id",
        as: "account",
      },
    },
    { $unwind: "$account" },
    { $match: { "account.code": { $regex: /^1200/ } } },
    {
      $group: {
        _id: null,
        balance: {
          $sum: {
            $cond: [{ $eq: ["$entry_type", "debit"] }, "$amount", { $multiply: ["$amount", -1] }],
          },
        },
      },
    },
  ]);
  const outstandingReceivables = receivablesResult[0]?.balance || 0;

  const payablesResult = await LedgerEntry.aggregate([
    {
      $lookup: {
        from: accCol,
        localField: "account_id",
        foreignField: "_id",
        as: "account",
      },
    },
    { $unwind: "$account" },
    { $match: { "account.code": { $regex: /^2100/ } } },
    {
      $group: {
        _id: null,
        balance: {
          $sum: {
            $cond: [{ $eq: ["$entry_type", "credit"] }, "$amount", { $multiply: ["$amount", -1] }],
          },
        },
      },
    },
  ]);
  const outstandingPayables = payablesResult[0]?.balance || 0;

  const lowStockItems = await InventoryService.getLowStockItems();

  const inventoryValueResult = await InventoryItem.aggregate([
    { $match: { is_active: true } },
    {
      $group: {
        _id: null,
        total_value: { $sum: { $multiply: ["$quantity", "$cost_price"] } },
      },
    },
  ]);
  const inventoryValue = inventoryValueResult[0]?.total_value || 0;

  return NextResponse.json({
    financial_summary: {
      total_revenue: totalRevenue,
      outstanding_receivables: outstandingReceivables,
      outstanding_payables: outstandingPayables,
      inventory_value: inventoryValue,
    },
    inventory_alerts: {
      low_stock_items: lowStockItems.map((item: any) => ({
        id: item._id,
        sku: item.sku,
        name: item.name,
        current_quantity: item.quantity,
        reorder_level: item.reorder_level,
      })),
      total_low_stock_items: lowStockItems.length,
    },
    generated_at: new Date().toISOString(),
  });
});
