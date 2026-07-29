'use client';

import { useState, useEffect } from 'react';
import { fetchLedger, type LedgerEntry } from '@/lib/api';

function fmt(n: number | string): string {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function LedgerTable({ refresh }: { refresh?: number }) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchLedger({ page, limit: 10 })
      .then(data => {
        setEntries(data.entries);
        setTotalPages(data.pagination.pages);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch ledger:', err);
        setLoading(false);
      });
  }, [page, refresh]);

  const filtered = entries.filter(e =>
    !query || 
    (e.transaction_description?.toLowerCase().includes(query.toLowerCase()) ||
     e.transaction_number?.toLowerCase().includes(query.toLowerCase()) ||
     e.account_name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <>
      <div className="flex gap-2 px-5 py-3.5 border-b border-rule flex-wrap items-center">
        <input
          className="flex-1 min-w-[160px] px-3 py-2 border border-rule-strong rounded-lg text-sm bg-[#FCFCFA]"
          placeholder="Search reference, account or description…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-muted">Loading ledger entries...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted">
            {entries.length === 0 ? 'No ledger entries yet. Create your first transaction!' : 'No matching entries found.'}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Date</th>
                <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Reference</th>
                <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Account</th>
                <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Description</th>
                <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Debit</th>
                <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Credit</th>
                <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#FAFBF7]">
                  <td className="px-5 py-[11px] border-b border-rule text-sm align-middle">
                    {formatDate(entry.transaction_date)}
                  </td>
                  <td className="px-5 py-[11px] border-b border-rule text-sm align-middle font-mono text-xs text-muted">
                    {entry.transaction_number || entry.transaction_id.slice(0, 8)}
                  </td>
                  <td className="px-5 py-[11px] border-b border-rule text-sm align-middle">
                    <div className="font-medium text-xs">{entry.account_code}</div>
                    <div className="text-[11px] text-faint">{entry.account_name}</div>
                  </td>
                  <td className="px-5 py-[11px] border-b border-rule text-sm align-middle">
                    <div className="font-medium text-xs">{entry.transaction_description}</div>
                    <div className="text-[11px] text-faint capitalize">{entry.transaction_type}</div>
                  </td>
                  <td className="px-5 py-[11px] border-b border-rule text-sm align-middle text-right font-mono text-debit">
                    {entry.entry_type === 'debit' ? fmt(entry.amount) : '—'}
                  </td>
                  <td className="px-5 py-[11px] border-b border-rule text-sm align-middle text-right font-mono text-credit">
                    {entry.entry_type === 'credit' ? fmt(entry.amount) : '—'}
                  </td>
                  <td className="px-5 py-[11px] border-b border-rule text-sm align-middle text-right font-mono font-semibold">
                    {fmt(entry.running_balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-rule text-xs text-muted">
        <span>Page {page} of {totalPages || 1}</span>
        <div className="flex gap-1.5">
          <button 
            className="w-7 h-7 border border-rule-strong bg-surface rounded-[5px] cursor-pointer text-xs text-muted font-mono disabled:opacity-40 disabled:cursor-not-allowed" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ‹
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                className={`w-7 h-7 border rounded-[5px] cursor-pointer text-xs font-mono ${
                  page === pageNum 
                    ? 'border-ink bg-ink text-white' 
                    : 'border-rule-strong bg-surface text-muted'
                }`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            className="w-7 h-7 border border-rule-strong bg-surface rounded-[5px] cursor-pointer text-xs text-muted font-mono disabled:opacity-40 disabled:cursor-not-allowed" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}
