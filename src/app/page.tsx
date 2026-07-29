'use client';

import { useState, useEffect } from 'react';
import TransactionForm from "@/components/TransactionForm";
import LedgerTable from "@/components/LedgerTable";
import { fetchSummary, fetchInventory, checkHealth, ApiError, type FinancialSummary, type InventoryItem } from "@/lib/api";

function SkeletonCard() {
  return (
    <div className="bg-surface border border-rule rounded-lg px-[18px] py-4 relative overflow-hidden animate-pulse">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E0E0D8]" />
      <div className="bg-[#E8E8E0] rounded h-2.5 w-24 mb-3" />
      <div className="bg-[#E8E8E0] rounded h-8 w-28 mb-2" />
      <div className="bg-[#E8E8E0] rounded h-3 w-16" />
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [summaryError, setSummaryError] = useState('');
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setSummaryError('');

    try {
      const [summaryData, lowStock, healthData] = await Promise.all([
        fetchSummary(),
        fetchInventory(true),
        checkHealth().catch(() => ({ status: 'unknown' })),
      ]);
      setSummary(summaryData);
      setLowStockItems(lowStock);
      setHealth(healthData);
    } catch (err: any) {
      setSummaryError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleTransactionSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <div className="flex items-center justify-between px-[30px] py-4 border-b border-rule bg-surface">
        <div>
          <h1 className="font-serif font-semibold text-[19px]">Overview</h1>
          <div className="text-xs text-muted mt-0.5">
            {currentDate} · All amounts in ₹
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-[20px] border border-rule-strong bg-surface text-muted">
            <span className={`w-[6px] h-[6px] rounded-full ${health?.status === 'ok' ? 'bg-[#59C08A]' : 'bg-[#E3B23C]'}`} />
            {health?.status === 'ok' ? 'All systems normal' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="flex-1 p-[30px] pb-[60px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[26px]">
          {loading ? (
            <>
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </>
          ) : summaryError ? (
            <div className="col-span-full text-center py-6">
              <div className="text-muted mb-3">{summaryError}</div>
              <button
                className="px-4 py-2 border border-rule-strong rounded-lg text-sm font-semibold cursor-pointer bg-surface text-muted hover:bg-[#F6F7F1]"
                onClick={loadData}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="bg-surface border border-rule rounded-lg px-[18px] py-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-green" />
                <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Total Revenue</div>
                <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">
                  ₹{summary?.financial_summary.total_revenue.toLocaleString('en-IN') || '0'}
                </div>
                <div className="text-[11.5px] mt-1.5 font-mono text-credit">All time</div>
              </div>

              <div className="bg-surface border border-rule rounded-lg px-[18px] py-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-debit" />
                <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Outstanding Receivables</div>
                <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">
                  ₹{summary?.financial_summary.outstanding_receivables.toLocaleString('en-IN') || '0'}
                </div>
                <div className="text-[11.5px] mt-1.5 font-mono text-muted">To collect</div>
              </div>

              <div className="bg-surface border border-rule rounded-lg px-[18px] py-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-pending" />
                <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Low Stock Alerts</div>
                <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">
                  {summary?.inventory_alerts.total_low_stock_items || 0}
                </div>
                <div className="text-[11.5px] mt-1.5 font-mono text-muted">items below threshold</div>
              </div>

              <div className="bg-surface border border-rule rounded-lg px-[18px] py-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-flag" />
                <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Inventory Value</div>
                <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">
                  ₹{summary?.financial_summary.inventory_value.toLocaleString('en-IN') || '0'}
                </div>
                <div className="text-[11.5px] mt-1.5 font-mono text-muted">at cost</div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-[400px_1fr] max-lg:grid-cols-1 gap-[18px] items-start">
          <TransactionForm onSuccess={handleTransactionSuccess} />
          <div className="bg-surface border border-rule rounded-lg" id="ledger-panel">
            <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
              <div>
                <div className="text-[10.5px] tracking-[0.1em] uppercase text-faint font-semibold">History</div>
                <h2 className="font-serif font-semibold text-[15.5px]">Ledger</h2>
              </div>
            </div>
            <LedgerTable refresh={refreshKey} />
          </div>
        </div>

        {!loading && !summaryError && lowStockItems.length > 0 && (
          <div className="mt-[18px] bg-pending-bg border border-[#E4CE96] rounded-lg px-[18px] py-3.5 flex items-center gap-3.5">
            <div className="w-[30px] h-[30px] rounded-full bg-surface flex items-center justify-center text-[15px] flex-none border-[1.5px] border-pending text-pending font-bold">!</div>
            <div className="flex-1">
              <div className="font-semibold text-[13.5px] text-[#7A5A17]">
                {lowStockItems.length} items are below their reorder threshold
              </div>
              <div className="text-xs text-[#8C7238] mt-0.5">
                Restock soon to avoid stockouts on your next sale.
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {lowStockItems.slice(0, 3).map(item => (
                <span key={item.id} className="bg-surface border border-[#E4CE96] px-2.5 py-1 rounded-[14px] text-[11.5px] font-mono text-[#7A5A17]">
                  {item.name} — {item.quantity} left
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}