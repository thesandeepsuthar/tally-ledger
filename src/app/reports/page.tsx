'use client';

import { useState, useEffect } from 'react';
import { fetchSummary, type FinancialSummary } from '@/lib/api';

function fmt(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary()
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch summary:', err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="flex items-center justify-between px-[30px] py-4 border-b border-rule bg-surface">
        <div>
          <h1 className="font-serif font-semibold text-[19px]">Reports</h1>
          <div className="text-xs text-muted mt-0.5">
            Financial summary and analytics
          </div>
        </div>
      </div>

      <div className="flex-1 p-[30px] pb-[60px]">
        {loading ? (
          <div className="text-center py-12 text-muted">Loading reports...</div>
        ) : (
          <div className="space-y-[18px]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
              <div className="bg-surface border border-rule rounded-lg px-[18px] py-5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-green" />
                <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Total Revenue</div>
                <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">
                  {fmt(summary?.financial_summary.total_revenue || 0)}
                </div>
              </div>
              <div className="bg-surface border border-rule rounded-lg px-[18px] py-5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-debit" />
                <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Receivables</div>
                <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">
                  {fmt(summary?.financial_summary.outstanding_receivables || 0)}
                </div>
              </div>
              <div className="bg-surface border border-rule rounded-lg px-[18px] py-5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-pending" />
                <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Payables</div>
                <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">
                  {fmt(summary?.financial_summary.outstanding_payables || 0)}
                </div>
              </div>
              <div className="bg-surface border border-rule rounded-lg px-[18px] py-5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-flag" />
                <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Inventory Value</div>
                <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">
                  {fmt(summary?.financial_summary.inventory_value || 0)}
                </div>
              </div>
            </div>

            <div className="bg-surface border border-rule rounded-lg">
              <div className="px-5 py-4 border-b border-rule">
                <h2 className="font-serif font-semibold text-[15.5px]">Low Stock Alerts</h2>
              </div>
              <div className="p-5">
                {summary && summary.inventory_alerts.low_stock_items.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-3 py-2 border-b border-rule bg-[#FAFBF7]">SKU</th>
                        <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-3 py-2 border-b border-rule bg-[#FAFBF7]">Item</th>
                        <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-3 py-2 border-b border-rule bg-[#FAFBF7]">Quantity</th>
                        <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-3 py-2 border-b border-rule bg-[#FAFBF7]">Reorder At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.inventory_alerts.low_stock_items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-[#FAFBF7]">
                          <td className="px-3 py-[9px] border-b border-rule text-sm font-mono text-xs text-muted">{item.sku}</td>
                          <td className="px-3 py-[9px] border-b border-rule text-sm font-medium">{item.name}</td>
                          <td className="px-3 py-[9px] border-b border-rule text-sm text-right font-mono text-debit">{item.current_quantity}</td>
                          <td className="px-3 py-[9px] border-b border-rule text-sm text-right font-mono">{item.reorder_level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-muted">No low stock items.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
