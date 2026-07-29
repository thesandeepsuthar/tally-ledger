import db from "@/db/knex";
import { Knex } from "knex";

export interface LedgerEntry {
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
  entries: LedgerEntry[];
  metadata?: Record<string, any>;
}

export class LedgerService {
  static async validateDoubleEntry(entries: LedgerEntry[]): Promise<void> {
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
    trx?: Knex.Transaction
  ): Promise<any> {
    const transaction = async (tx: Knex.Transaction) => {
      const existing = await tx("transactions")
        .where("idempotency_key", request.idempotency_key)
        .first();

      if (existing) {
        const entries = await tx("ledger_entries")
          .where("transaction_id", existing.id)
          .orderBy("created_at");
        return { transaction: existing, entries };
      }

      await this.validateDoubleEntry(request.entries);

      const [transactionRecord] = await tx("transactions")
        .insert({
          idempotency_key: request.idempotency_key,
          transaction_type: request.transaction_type,
          description: request.description,
          reference_number: request.reference_number,
          transaction_date: request.transaction_date || new Date(),
          status: "completed",
          metadata: request.metadata ? JSON.stringify(request.metadata) : null,
        })
        .returning("*");

      const ledgerEntries = await Promise.all(
        request.entries.map((entry) =>
          tx("ledger_entries")
            .insert({
              transaction_id: transactionRecord.id,
              account_id: entry.account_id,
              entry_type: entry.entry_type,
              amount: entry.amount,
              description: entry.description,
            })
            .returning("*")
        )
      );

      return {
        transaction: transactionRecord,
        entries: ledgerEntries.flat(),
      };
    };

    if (trx) {
      return transaction(trx);
    }

    return db.transaction(transaction);
  }

  static async getLedgerEntries(filters: {
    account_id?: string;
    start_date?: Date;
    end_date?: Date;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const { account_id, start_date, end_date, page = 1, limit = 50 } = filters;

    let query = db("ledger_entries as le")
      .join("transactions as t", "le.transaction_id", "t.id")
      .join("accounts as a", "le.account_id", "a.id")
      .select(
        "le.id",
        "le.transaction_id",
        "le.entry_type",
        "le.amount",
        "le.description as entry_description",
        "le.created_at",
        "t.transaction_type",
        "t.transaction_number",
        "t.transaction_date",
        "t.description as transaction_description",
        "a.code as account_code",
        "a.name as account_name",
        "a.type as account_type"
      );

    if (account_id) {
      query = query.where("le.account_id", account_id);
    }

    if (start_date) {
      query = query.where("t.transaction_date", ">=", start_date);
    }

    if (end_date) {
      query = query.where("t.transaction_date", "<=", end_date);
    }

    const total = await query.clone().clearSelect().count("* as count").first();
    const entries = await query
      .orderBy("t.transaction_date", "desc")
      .orderBy("le.created_at", "desc")
      .limit(limit)
      .offset((page - 1) * limit);

    let runningBalance = 0;
    const entriesWithBalance = entries.map((entry: any) => {
      if (entry.entry_type === "debit") {
        runningBalance += parseFloat(entry.amount);
      } else {
        runningBalance -= parseFloat(entry.amount);
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
        total: parseInt(total?.count as string) || 0,
        pages: Math.ceil((parseInt(total?.count as string) || 0) / limit),
      },
    };
  }
}
