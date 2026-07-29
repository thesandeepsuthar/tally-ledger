import { NextRequest, NextResponse } from "next/server";
import db from "@/db/knex";
import { LedgerService } from "@/services/ledgerService";
import { InventoryService } from "@/services/inventoryService";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      idempotency_key = uuidv4(),
      transaction_type,
      description,
      reference_number,
      transaction_date,
      entries,
      inventory_movements,
      metadata,
    } = body;

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: "At least one ledger entry is required" },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (trx) => {
      const transactionResult = await LedgerService.createTransaction(
        {
          idempotency_key,
          transaction_type,
          description,
          reference_number,
          transaction_date: transaction_date ? new Date(transaction_date) : undefined,
          entries,
          metadata,
        },
        trx
      );

      if (inventory_movements && inventory_movements.length > 0) {
        await InventoryService.updateInventory(
          inventory_movements,
          transactionResult.transaction.id,
          trx
        );
      }

      return transactionResult;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("Double-entry validation")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message?.includes("Insufficient stock")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error.constraint === "transactions_idempotency_key_unique") {
      return NextResponse.json(
        { error: "Transaction already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
