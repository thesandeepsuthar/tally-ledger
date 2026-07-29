import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { withDB } from "@/lib/api-handler";
import { LedgerService } from "@/services/ledgerService";
import { InventoryService } from "@/services/inventoryService";
import { v4 as uuidv4 } from "uuid";

export const POST = withDB(async (request: NextRequest) => {
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

  const session = await mongoose.startSession();
  let result;

  try {
    session.startTransaction();

    result = await LedgerService.createTransaction(
      {
        idempotency_key,
        transaction_type,
        description,
        reference_number,
        transaction_date: transaction_date ? new Date(transaction_date) : undefined,
        entries,
        metadata,
      },
      session
    );

    if (inventory_movements && inventory_movements.length > 0) {
      await InventoryService.updateInventory(
        inventory_movements,
        result.transaction._id.toString(),
        session
      );
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return NextResponse.json(result, { status: 201 });
});
