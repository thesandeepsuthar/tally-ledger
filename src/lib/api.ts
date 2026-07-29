export interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  description?: string;
  is_active: boolean;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unit_price: number;
  cost_price: number;
  quantity: number;
  reorder_level: number;
  unit_of_measure: string;
  is_active: boolean;
}

export interface LedgerEntry {
  id: string;
  transaction_id: string;
  entry_type: "debit" | "credit";
  amount: string;
  entry_description?: string;
  transaction_type: string;
  transaction_number?: string;
  transaction_date: string;
  transaction_description?: string;
  status?: string;
  account_code: string;
  account_name: string;
  account_type: string;
  running_balance: number;
}

export interface TransactionEntry {
  account_id: string;
  entry_type: "debit" | "credit";
  amount: number;
  description?: string;
}

export interface InventoryMovement {
  inventory_item_id: string;
  quantity: number;
  movement_type: "sale" | "purchase" | "adjustment" | "return";
  unit_cost?: number;
  notes?: string;
}

export interface CreateTransactionRequest {
  idempotency_key: string;
  transaction_type: "sale" | "purchase" | "payment" | "receipt" | "journal";
  description?: string;
  reference_number?: string;
  transaction_date?: string;
  entries: TransactionEntry[];
  inventory_movements?: InventoryMovement[];
  metadata?: Record<string, any>;
}

export interface FinancialSummary {
  financial_summary: {
    total_revenue: number;
    outstanding_receivables: number;
    outstanding_payables: number;
    inventory_value: number;
  };
  inventory_alerts: {
    low_stock_items: Array<{
      id: string;
      sku: string;
      name: string;
      current_quantity: number;
      reorder_level: number;
    }>;
    total_low_stock_items: number;
  };
  generated_at: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_BASE = "/api/v1";
const REQUEST_TIMEOUT = 15000;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;
      try {
        const body = await res.json();
        message = body.error || message;
      } catch {}
      throw new ApiError(message, res.status);
    }

    return res.json();
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new ApiError("Request timed out", 0);
    }
    throw err;
  }
}

export async function fetchAccounts(): Promise<Account[]> {
  return request<Account[]>(`${API_BASE}/accounts`);
}

export async function fetchInventory(lowStock?: boolean): Promise<InventoryItem[]> {
  const url = lowStock ? `${API_BASE}/inventory?low_stock=true` : `${API_BASE}/inventory`;
  return request<InventoryItem[]>(url);
}

export async function createTransaction(data: CreateTransactionRequest) {
  return request(`${API_BASE}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function fetchLedger(params?: {
  account_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.account_id) searchParams.set("account_id", params.account_id);
  if (params?.start_date) searchParams.set("start_date", params.start_date);
  if (params?.end_date) searchParams.set("end_date", params.end_date);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const url = `${API_BASE}/ledger${searchParams.toString() ? `?${searchParams}` : ""}`;
  return request<{ entries: LedgerEntry[]; pagination: { page: number; limit: number; total: number; pages: number } }>(url);
}

export async function fetchSummary(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<FinancialSummary> {
  const searchParams = new URLSearchParams();
  if (params?.start_date) searchParams.set("start_date", params.start_date);
  if (params?.end_date) searchParams.set("end_date", params.end_date);

  const url = `${API_BASE}/reports/summary${searchParams.toString() ? `?${searchParams}` : ""}`;
  return request<FinancialSummary>(url);
}

export async function checkHealth() {
  return request<{ status: string; database: string }>("/api/health");
}