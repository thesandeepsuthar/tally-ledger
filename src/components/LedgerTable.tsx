'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchLedger, ApiError, type LedgerEntry } from '@/lib/api';

function fmt(n: number | string): string {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const styles: Record<string, { label: string; classes: string }> = {
    completed: { label: 'Reconciled', classes: 'bg-[#E6F7EC] text-[#1E7B4A] border-[#B8E6CC]' },
    pending: { label: 'Pending', classes: 'bg-[#FFF8E6] text-[#8C6E1A] border-[#E8DAA0]' },
    cancelled: { label: 'Flagged', classes: 'bg-[#FDE8E8] text-[#B91C1C] border-[#F5C6C6]' },
  };
  const s = styles[status] || { label: status, classes: 'bg-[#F0F0F0] text-[#666] border-[#D0D0D0]' };
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-[0.05em] px-2 py-0.5 rounded-full border ${s.classes}`}>
      {s.label}
    </span>
  );
}

const SKELETON_WIDTHS = ['55%', '35%', '45%', '60%', '30%', '40%', '40%', '50%'];

function SkeletonRow() {
  return (
    <tr>
      {SKELETON_WIDTHS.map((w, i) => (
        <td key={i} className="px-5 py-[11px] border-b border-rule">
          <div className="animate-pulse bg-[#E8E8E0] rounded h-3" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

export default function LedgerTable({ refresh }: { refresh?: number }) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<string>('transaction_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadEntries = useCallback(() => {
    setLoading(true);
    setLoadError('');
    fetchLedger({
      page,
      limit: 10,
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
    })
      .then(data => {
        setEntries(data.entries);
        setTotalPages(data.pagination.pages);
        setLoading(false);
      })
      .catch(err => {
        setLoadError(err instanceof ApiError ? err.message : 'Failed to load ledger');
        setLoading(false);
      });
  }, [page, startDate, endDate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries, refresh]);

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filtered = entries
    .filter(e =>
      !query ||
      (e.transaction_description?.toLowerCase().includes(query.toLowerCase()) ||
       e.transaction_number?.toLowerCase().includes(query.toLowerCase()) ||
       e.account_name.toLowerCase().includes(query.toLowerCase()))
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'transaction_date') {
        cmp = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      } else if (sortField === 'amount') {
        cmp = parseFloat(a.amount) - parseFloat(b.amount);
      } else if (sortField === 'account_name') {
        cmp = a.account_name.localeCompare(b.account_name);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span className="ml-1 text-faint">↕</span>;
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <>
      <div className="flex gap-2 px-5 py-3.5 border-b border-rule flex-wrap items-center">
        <input
          className="flex-1 min-w-[140px] px-3 py-2 border border-rule-strong rounded-lg text-sm bg-[#FCFCFA]"
          placeholder="Search reference, account or description…"
          value={query}
          onChange={e => handleSearch(e.target.value)}
        />
        <input
          type="date"
          value={startDate}
          onChange={e => { setStartDate(e.target.value); setPage(1); }}
          className="px-2.5 py-2 border border-rule-strong rounded-lg text-sm bg-[#FCFCFA] w-[140px]"
          title="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => { setEndDate(e.target.value); setPage(1); }}
          className="px-2.5 py-2 border border-rule-strong rounded-lg text-sm bg-[#FCFCFA] w-[140px]"
          title="End date"
        />
      </div>

      <div className="overflow-x-auto">
        {loading && (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {Array.from({ length: 8 }).map((_, i) => (
                  <th key={i} className="px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">
                    <div className="animate-pulse bg-[#D8D8D0] rounded h-2.5 w-12" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        )}

        {!loading && loadError && (
          <div className="text-center py-12">
            <div className="text-muted mb-3">{loadError}</div>
            <button
              className="px-4 py-2 border border-rule-strong rounded-lg text-sm font-semibold cursor-pointer bg-surface text-muted hover:bg-[#F6F7F1]"
              onClick={() => { setPage(1); loadEntries(); }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && filtered.length === 0 && (
          <div className="text-center py-12 text-muted">
            {entries.length === 0 ? 'No ledger entries yet. Create your first transaction!' : 'No matching entries found.'}
          </div>
        )}

        {!loading && !loadError && filtered.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7] cursor-pointer select-none" onClick={() => handleSort('transaction_date')}>
                  Date<SortIcon field="transaction_date" />
                </th>
                <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Reference</th>
                <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7] cursor-pointer select-none" onClick={() => handleSort('account_name')}>
                  Account<SortIcon field="account_name" />
                </th>
                <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Description</th>
                <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Status</th>
                <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7] cursor-pointer select-none" onClick={() => handleSort('amount')}>
                  Debit<SortIcon field="amount" />
                </th>
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
                  <td className="px-5 py-[11px] border-b border-rule align-middle">
                    <StatusBadge status={entry.status} />
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
            disabled={page === 1 || loading}
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
                disabled={loading}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            className="w-7 h-7 border border-rule-strong bg-surface rounded-[5px] cursor-pointer text-xs text-muted font-mono disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0 || loading}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}