import mongoose, { ClientSession, Types } from "mongoose";
import { Transaction } from "@/db/models/Transaction";
import { LedgerEntry } from "@/db/models/LedgerEntry";
import { Account } from "@/db/models/Account";

export interface LedgerEntryInput {
  account_id: string;
  entry_type: "debit" | "credit";
  amount: number;
  description?: string;
}

export interface TransactionRequest {
  idempotency_key: string;
  transaction_type: "sale" | "purchase" | "payment" | "receipt" | "journal";
  description?: string;
  reference_number?: string;
  transaction_date?: Date;
  entries: LedgerEntryInput[];
  metadata?: Record<string, any>;
}

export class LedgerService {
  static async validateDoubleEntry(entries: LedgerEntryInput[]): Promise<void> {
    let debitTotal = 0;
    let creditTotal = 0;

    for (const entry of entries) {
      if (entry.entry_type === "debit") {
        debitTotal += entry.amount;
      } else {
        creditTotal += entry.amount;
      }
    }

    if (Math.abs(debitTotal - creditTotal) > 0.01) {
      throw new Error(
        `Double-entry validation failed: Debits (${debitTotal}) must equal Credits (${creditTotal})`
      );
    }
  }

  static async createTransaction(
    request: TransactionRequest,
    session?: ClientSession
  ): Promise<any> {
    const sessionOption = session ? { session } : {};

    const existing = await Transaction.findOne({ idempotency_key: request.idempotency_key }, null, sessionOption);
    if (existing) {
      const entries = await LedgerEntry.find({ transaction_id: existing._id }, null, sessionOption).sort({ createdAt: 1 });
      return { transaction: existing, entries };
    }

    await this.validateDoubleEntry(request.entries);

    const [transactionRecord] = await Transaction.create(
      [{
        idempotency_key: request.idempotency_key,
        transaction_type: request.transaction_type,
        description: request.description,
        reference_number: request.reference_number,
        transaction_date: request.transaction_date || new Date(),
        status: "completed",
        metadata: request.metadata,
      }],
      sessionOption
    );

    const ledgerEntries = await LedgerEntry.create(
      request.entries.map((entry) => ({
        transaction_id: transactionRecord._id,
        account_id: new Types.ObjectId(entry.account_id),
        entry_type: entry.entry_type,
        amount: entry.amount,
        description: entry.description,
      })),
      { ...sessionOption, ordered: true }
    );

    return {
      transaction: transactionRecord,
      entries: ledgerEntries,
    };
  }

  static async getLedgerEntries(filters: {
    account_id?: string;
    start_date?: Date;
    end_date?: Date;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const { account_id, start_date, end_date, page = 1, limit = 50 } = filters;

    const transCol = Transaction.collection.name;
    const accCol = Account.collection.name;

    const pipeline: any[] = [];

    pipeline.push(
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
        $lookup: {
          from: accCol,
          localField: "account_id",
          foreignField: "_id",
          as: "account",
        },
      },
      { $unwind: "$account" }
    );

    const matchFilter: any = {};
    if (account_id) {
      matchFilter["account._id"] = new Types.ObjectId(account_id);
    }
    if (start_date || end_date) {
      matchFilter["transaction.transaction_date"] = {};
      if (start_date) matchFilter["transaction.transaction_date"].$gte = start_date;
      if (end_date) matchFilter["transaction.transaction_date"].$lte = end_date;
    }
    if (Object.keys(matchFilter).length > 0) {
      pipeline.push({ $match: matchFilter });
    }

    const countResult = await LedgerEntry.aggregate([...pipeline, { $count: "total" }]);
    const total = countResult[0]?.total ?? 0;

    pipeline.push(
      { $sort: { "transaction.transaction_date": -1, createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          id: "$_id",
          _id: 0,
          transaction_id: 1,
          entry_type: 1,
          amount: 1,
          entry_description: { $ifNull: ["$description", ""] },
          created_at: "$createdAt",
          transaction_type: "$transaction.transaction_type",
          transaction_number: "$transaction.transaction_number",
          transaction_date: "$transaction.transaction_date",
          transaction_description: "$transaction.description",
          status: "$transaction.status",
          account_code: "$account.code",
          account_name: "$account.name",
          account_type: "$account.type",
        },
      }
    );

    const entries = await LedgerEntry.aggregate(pipeline);

    let runningBalance = 0;
    const entriesWithBalance = entries.map((entry: any) => {
      if (entry.entry_type === "debit") {
        runningBalance += entry.amount;
      } else {
        runningBalance -= entry.amount;
      }
      return {
        ...entry,
        running_balance: runningBalance,
      };
    });

    return {
      entries: entriesWithBalance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
