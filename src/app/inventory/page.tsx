'use client';

import { useState, useEffect } from 'react';
import { fetchInventory, type InventoryItem } from '@/lib/api';

function fmt(n: number | string): string {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchInventory(showLowStock || undefined)
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch inventory:', err);
        setLoading(false);
      });
  }, [showLowStock]);

  return (
    <>
      <div className="flex items-center justify-between px-[30px] py-4 border-b border-rule bg-surface">
        <div>
          <h1 className="font-serif font-semibold text-[19px]">Inventory</h1>
          <div className="text-xs text-muted mt-0.5">
            Stock items and quantities
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={e => setShowLowStock(e.target.checked)}
              className="accent-green"
            />
            Low stock only
          </label>
        </div>
      </div>

      <div className="flex-1 p-[30px] pb-[60px]">
        {loading ? (
          <div className="text-center py-12 text-muted">Loading inventory...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted">
            {showLowStock ? 'No low stock items found.' : 'No inventory items yet.'}
          </div>
        ) : (
          <div className="bg-surface border border-rule rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">SKU</th>
                  <th className="text-left text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Name</th>
                  <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Quantity</th>
                  <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Unit Price</th>
                  <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Cost Price</th>
                  <th className="text-right text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Reorder Level</th>
                  <th className="text-center text-[10.5px] uppercase tracking-[0.07em] text-faint font-semibold px-5 py-2.5 border-b border-rule bg-[#FAFBF7]">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isLowStock = item.quantity <= item.reorder_level;
                  return (
                    <tr key={item.id} className="hover:bg-[#FAFBF7]">
                      <td className="px-5 py-[11px] border-b border-rule text-sm font-mono text-xs text-muted">{item.sku}</td>
                      <td className="px-5 py-[11px] border-b border-rule text-sm font-medium">{item.name}</td>
                      <td className="px-5 py-[11px] border-b border-rule text-sm text-right font-mono">{item.quantity}</td>
                      <td className="px-5 py-[11px] border-b border-rule text-sm text-right font-mono">{fmt(item.unit_price)}</td>
                      <td className="px-5 py-[11px] border-b border-rule text-sm text-right font-mono">{fmt(item.cost_price)}</td>
                      <td className="px-5 py-[11px] border-b border-rule text-sm text-right font-mono">{item.reorder_level}</td>
                      <td className="px-5 py-[11px] border-b border-rule text-sm text-center">
                        {isLowStock ? (
                          <span className="stamp stamp-pending">Low stock</span>
                        ) : (
                          <span className="stamp stamp-reconciled">In stock</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
