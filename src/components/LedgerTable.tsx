'use client';

import { useState } from 'react';

interface Entry {
  date: string;
  ref: string;
  desc: string;
  sub: string;
  debit: number | null;
  credit: number | null;
  bal: number;
  status: 'reconciled' | 'pending' | 'flagged';
}

const DATA: Entry[] = [
  { date: '27 Jul', ref: 'TXN-10294', desc: 'Sale — Anand Traders', sub: '12× line items', debit: null, credit: 14250, bal: 96420, status: 'reconciled' },
  { date: '27 Jul', ref: 'TXN-10293', desc: 'Purchase — Shree Distributors', sub: 'Stock replenishment', debit: 22800, credit: null, bal: 82170, status: 'reconciled' },
  { date: '26 Jul', ref: 'TXN-10291', desc: 'Sale — Ramesh Kirana', sub: '4× line items', debit: null, credit: 3120, bal: 104970, status: 'pending' },
  { date: '26 Jul', ref: 'TXN-10290', desc: 'Sale — Walk-in customer', sub: 'Cash sale', debit: null, credit: 860, bal: 101850, status: 'reconciled' },
  { date: '25 Jul', ref: 'TXN-10287', desc: 'Reversal — TXN-10240', sub: 'Duplicate post correction', debit: 5400, credit: null, bal: 100990, status: 'flagged' },
  { date: '25 Jul', ref: 'TXN-10286', desc: 'Purchase — Om Wholesale', sub: 'Bulk grain order', debit: 31200, credit: null, bal: 106390, status: 'reconciled' },
  { date: '24 Jul', ref: 'TXN-10281', desc: 'Sale — Anand Traders', sub: '8× line items', debit: null, credit: 9640, bal: 137590, status: 'flagged' },
  { date: '24 Jul', ref: 'TXN-10279', desc: 'Sale — Priya Enterprises', sub: 'GST inclusive', debit: null, credit: 2210, bal: 127950, status: 'reconciled' },
];

const COUNTS = {
  all: DATA.length,
  reconciled: DATA.filter(e => e.status === 'reconciled').length,
  pending: DATA.filter(e => e.status === 'pending').length,
  flagged: DATA.filter(e => e.status === 'flagged').length,
};

function fmt(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function stampClass(status: string): string {
  return 'stamp stamp-' + status;
}

function stampLabel(status: string): string {
  return status === 'reconciled' ? 'Reconciled' : status === 'pending' ? 'Pending' : 'Flagged';
}

export default function LedgerTable() {
  const [filter, setFilter] = useState<string>('all');
  const [query, setQuery] = useState('');

  const filtered = DATA
    .filter(e => filter === 'all' || e.status === filter)
    .filter(e => !query || (e.desc + e.ref).toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <div className="flex gap-2 px-5 py-3.5 border-b border-rule flex-wrap items-center">
        <input
          className="flex-1 min-w-[160px] px-3 py-2 border border-rule-strong rounded-lg text-sm bg-[#FCFCFA]"
          placeholder="Search reference, party or description…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {(['all', 'reconciled', 'pending', 'flagged'] as const).map(key => (
          <button
            key={key}
            className={`px-3 py-[7px] rounded-[20px] border text-xs font-semibold cursor-pointer ${
              filter === key
                ? 'bg-ink text-white border-ink'
                : 'border-rule-strong bg-surface text-muted'
            }`}
            onClick={() => setFilter(key)}
          >
            {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
            <span className="opacity-60 ml-1">{COUNTS[key]}</span>
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Date</th>
              <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Reference</th>
              <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Description</th>
              <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Debit</th>
              <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Credit</th>
              <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Balance</th>
              <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, i) => (
              <tr key={i} className="hover:bg-[#FAFBF7]">
                <td className="px-5 py-[11px] border-b border-rule text-sm align-middle">{entry.date}</td>
                <td className="px-5 py-[11px] border-b border-rule text-sm align-middle font-mono text-xs text-muted">{entry.ref}</td>
                <td className="px-5 py-[11px] border-b border-rule text-sm align-middle">
                  <div className="font-medium">{entry.desc}</div>
                  <div className="text-[11.5px] text-faint mt-px">{entry.sub}</div>
                </td>
                <td className="px-5 py-[11px] border-b border-rule text-sm align-middle text-right font-mono text-debit">{entry.debit ? fmt(entry.debit) : '—'}</td>
                <td className="px-5 py-[11px] border-b border-rule text-sm align-middle text-right font-mono text-credit">{entry.credit ? fmt(entry.credit) : '—'}</td>
                <td className="px-5 py-[11px] border-b border-rule text-sm align-middle text-right font-mono font-semibold">{fmt(entry.bal)}</td>
                <td className="px-5 py-[11px] border-b border-rule text-sm align-middle">
                  <span className={stampClass(entry.status)}>{stampLabel(entry.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-rule text-xs text-muted">
        <span>Showing 1–{filtered.length} of {filtered.length} entries</span>
        <div className="flex gap-1.5">
          <button className="w-7 h-7 border border-rule-strong bg-surface rounded-[5px] cursor-pointer text-xs text-muted font-mono opacity-40 cursor-not-allowed" disabled>‹</button>
          <button className="w-7 h-7 border border-rule-strong bg-ink text-white rounded-[5px] cursor-pointer text-xs font-mono">1</button>
          <button className="w-7 h-7 border border-rule-strong bg-surface rounded-[5px] cursor-pointer text-xs text-muted font-mono">2</button>
          <button className="w-7 h-7 border border-rule-strong bg-surface rounded-[5px] cursor-pointer text-xs text-muted font-mono">3</button>
          <button className="w-7 h-7 border border-rule-strong bg-surface rounded-[5px] cursor-pointer text-xs text-muted font-mono">›</button>
        </div>
      </div>
    </>
  );
}
