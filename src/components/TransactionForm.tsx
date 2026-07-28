'use client';

import { useState, useCallback } from 'react';

const ITEMS = ['Basmati Rice 5kg', 'Sunflower Oil 1L', 'Toor Dal 1kg', 'Tata Salt 1kg', 'Amul Butter 500g'];

interface LineItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
}

let counter = 2;

function fmt(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function genKey(): string {
  const hex = () => Math.random().toString(16).slice(2, 10);
  return 'txn_' + hex() + '-' + hex().slice(0, 4);
}

export default function TransactionForm() {
  const [type, setType] = useState<'sale' | 'purchase'>('sale');
  const [party, setParty] = useState('Anand Traders');
  const [date, setDate] = useState('2026-07-28');
  const [gstRate, setGstRate] = useState(0.18);
  const [payStatus, setPayStatus] = useState('Pending');
  const [lines, setLines] = useState<LineItem[]>([
    { id: 'li1', name: 'Basmati Rice 5kg', qty: 2, rate: 250 },
    { id: 'li2', name: 'Sunflower Oil 1L', qty: 1, rate: 100 },
  ]);
  const [idemKey, setIdemKey] = useState(genKey);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const addLine = useCallback(() => {
    counter++;
    setLines(prev => [...prev, {
      id: 'li' + counter,
      name: ITEMS[(counter - 1) % ITEMS.length],
      qty: 1,
      rate: 100,
    }]);
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateLine = useCallback((id: string, field: 'name' | 'qty' | 'rate', value: string | number) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  }, []);

  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.rate, 0);
  const gst = subtotal * gstRate;
  const total = subtotal + gst;

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3200);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast('Transaction posted — inventory and ledger updated atomically.');
      setIdemKey(genKey());
    }, 900);
  };

  const handleReset = () => {
    setParty('');
    setLines([
      { id: 'li' + ++counter, name: ITEMS[0], qty: 2, rate: 250 },
      { id: 'li' + ++counter, name: ITEMS[1], qty: 1, rate: 100 },
    ]);
    setIdemKey(genKey());
  };

  return (
    <>
      <div className="bg-surface border border-rule rounded-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
          <div>
            <div className="text-[10.5px] tracking-[0.1em] uppercase text-faint font-semibold">Record</div>
            <h2 className="font-serif font-semibold text-[15.5px]">New Transaction</h2>
          </div>
          <div className="flex border border-rule-strong rounded-lg overflow-hidden" style={{ width: 150 }}>
            <button
              className={`flex-1 px-2 py-2 border-none text-xs font-semibold tracking-[0.03em] cursor-pointer ${type === 'sale' ? 'bg-credit-bg text-credit' : 'bg-[#FCFCFA] text-muted'}`}
              onClick={() => setType('sale')}
            >
              Sale
            </button>
            <button
              className={`flex-1 px-2 py-2 border-none text-xs font-semibold tracking-[0.03em] cursor-pointer ${type === 'purchase' ? 'bg-debit-bg text-debit' : 'bg-[#FCFCFA] text-muted'}`}
              onClick={() => setType('purchase')}
            >
              Purchase
            </button>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="mb-3.5">
              <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-[0.05em] mb-1">Party name</label>
              <input
                type="text"
                placeholder="e.g. Anand Traders"
                value={party}
                onChange={e => setParty(e.target.value)}
                className="w-full px-2.5 py-2 border border-rule-strong rounded-[5px] text-[13.5px] bg-[#FCFCFA] text-ink focus:outline-2 focus:outline-green focus:outline-offset-1 focus:border-green"
              />
            </div>
            <div className="mb-3.5">
              <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-[0.05em] mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-2.5 py-2 border border-rule-strong rounded-[5px] text-[13.5px] bg-[#FCFCFA] text-ink focus:outline-2 focus:outline-green focus:outline-offset-1 focus:border-green"
              />
            </div>
          </div>

          <div className="mb-3.5">
            <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-[0.05em] mb-1">Line items</label>
            <div className="border border-rule rounded-lg overflow-hidden mb-1.5">
              <div className="grid grid-cols-[1fr_46px_70px_74px_24px] gap-1.5 items-center px-2 py-[7px] bg-[#F6F7F1] text-[10px] uppercase tracking-[0.06em] text-faint font-semibold border-b border-rule">
                <div>Item</div><div>Qty</div><div>Rate</div><div>Amount</div><div></div>
              </div>
              {lines.map(line => (
                <div key={line.id} className="grid grid-cols-[1fr_46px_70px_74px_24px] gap-1.5 items-center px-2 py-[7px] border-b border-rule last:border-none text-[13px]">
                  <input
                    type="text"
                    value={line.name}
                    onChange={e => updateLine(line.id, 'name', e.target.value)}
                    list="item-list"
                    className="w-full border border-transparent bg-transparent text-xs p-1 rounded focus:outline-none focus:border-rule-strong focus:bg-white"
                  />
                  <input
                    type="number"
                    value={line.qty}
                    min={1}
                    onChange={e => updateLine(line.id, 'qty', parseInt(e.target.value) || 0)}
                    className="w-full border border-transparent bg-transparent text-xs p-1 rounded focus:outline-none focus:border-rule-strong focus:bg-white"
                  />
                  <input
                    type="number"
                    value={line.rate}
                    min={0}
                    step="any"
                    onChange={e => updateLine(line.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full border border-transparent bg-transparent text-xs p-1 rounded focus:outline-none focus:border-rule-strong focus:bg-white"
                  />
                  <div className="font-mono text-right text-ink">{fmt(line.qty * line.rate)}</div>
                  <button
                    className="border-none bg-none text-faint cursor-pointer text-base leading-none hover:text-debit"
                    onClick={() => removeLine(line.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              className="w-full py-2 border border-dashed border-rule-strong rounded-lg bg-none text-green text-xs font-semibold cursor-pointer hover:bg-[#F6F7F1] mb-4"
              onClick={addLine}
            >
              + Add line item
            </button>
          </div>

          <datalist id="item-list">
            {ITEMS.map(item => (
              <option key={item} value={item} />
            ))}
          </datalist>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="mb-3.5">
              <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-[0.05em] mb-1">GST rate</label>
              <select
                value={gstRate}
                onChange={e => setGstRate(parseFloat(e.target.value))}
                className="w-full px-2.5 py-2 border border-rule-strong rounded-[5px] text-[13.5px] bg-[#FCFCFA] text-ink focus:outline-2 focus:outline-green focus:outline-offset-1 focus:border-green"
              >
                <option value={0.18}>18% (Standard)</option>
                <option value={0.05}>5% (Reduced)</option>
                <option value={0}>0% (Exempt)</option>
              </select>
            </div>
            <div className="mb-3.5">
              <label className="block text-[11.5px] font-semibold text-muted uppercase tracking-[0.05em] mb-1">Payment status</label>
              <select
                value={payStatus}
                onChange={e => setPayStatus(e.target.value)}
                className="w-full px-2.5 py-2 border border-rule-strong rounded-[5px] text-[13.5px] bg-[#FCFCFA] text-ink focus:outline-2 focus:outline-green focus:outline-offset-1 focus:border-green"
              >
                <option>Paid</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          <div className="border-t border-rule pt-3 mt-0.5">
            <div className="flex justify-between text-xs text-muted py-0.5">
              <span>Subtotal</span>
              <span className="font-mono text-ink">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted py-0.5">
              <span>GST ({Math.round(gstRate * 100)}%)</span>
              <span className="font-mono text-ink">{fmt(gst)}</span>
            </div>
            <div className="flex justify-between border-t border-ink mt-1.5 pt-2 text-sm font-semibold text-ink">
              <span>Total due</span>
              <span className="font-mono text-lg font-semibold">{fmt(total)}</span>
            </div>
          </div>

          <div className="text-[10.5px] text-faint font-mono bg-[#F6F7F1] border border-rule rounded-[5px] px-[9px] py-[7px] my-3.5">
            <b className="text-muted font-sans font-semibold uppercase tracking-[0.05em] text-[9.5px] block mb-1">Idempotency key (auto)</b>
            <span>{idemKey}</span> — retried submits with this key won't double-post
          </div>

          <div className="flex gap-2.5 mt-1">
            <button
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-rule-strong text-sm font-semibold cursor-pointer bg-surface text-muted"
              onClick={handleReset}
            >
              Clear
            </button>
            <button
              className="flex-[2] px-3.5 py-2.5 rounded-lg border text-sm font-semibold cursor-pointer bg-green border-green text-white flex items-center justify-center gap-2 hover:bg-green-deep disabled:opacity-60 disabled:cursor-progress"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && (
                <div className="w-[13px] h-[13px] border-2 border-white/35 border-t-white rounded-full animate-spin" />
              )}
              <span>{submitting ? 'Posting…' : 'Post transaction'}</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-[22px] right-[22px] bg-green-deep text-white px-4 py-3 rounded-lg text-sm flex gap-2.5 items-center shadow-2xl transition-all duration-300 z-50 ${
          toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 pointer-events-none'
        }`}
      >
        <span className="w-4 h-4 rounded-full bg-credit flex-none flex items-center justify-center text-[10px]">✓</span>
        <span>{toast}</span>
      </div>
    </>
  );
}
