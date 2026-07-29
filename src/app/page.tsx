import TransactionForm from "@/components/TransactionForm";
import LedgerTable from "@/components/LedgerTable";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen font-sans text-sm">
      {/* ===== Sidebar ===== */}
      <aside className="max-lg:hidden w-[220px] flex-none bg-green-deep text-[#EDEFE7] flex flex-col py-[22px]">
        <div className="px-[22px] pb-[22px] border-b border-white/10 mb-[18px]">
          <div className="font-serif font-semibold text-xl tracking-[0.02em] text-white">
            Ledger
          </div>
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-[#9FB0A5] mt-1">
            Reconciliation Portal
          </div>
        </div>
        <nav className="flex flex-col gap-px px-3">
          <a className="flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[13px] font-medium cursor-pointer bg-white/[0.09] text-white">
            <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
            Overview
          </a>
          <a className="flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[#C9D2C3] text-[13px] font-medium cursor-pointer hover:bg-white/[0.06] hover:text-white">
            <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
            New Transaction
          </a>
          <a className="flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[#C9D2C3] text-[13px] font-medium cursor-pointer hover:bg-white/[0.06] hover:text-white">
            <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
            Ledger
          </a>
          <a className="flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[#C9D2C3] text-[13px] font-medium cursor-pointer hover:bg-white/[0.06] hover:text-white">
            <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
            Inventory
          </a>
          <a className="flex items-center gap-2.5 px-3 py-[9px] rounded-[5px] text-[#C9D2C3] text-[13px] font-medium cursor-pointer hover:bg-white/[0.06] hover:text-white">
            <span className="w-[5px] h-[5px] rounded-full bg-current opacity-50" />
            Reports
          </a>
        </nav>
        <div className="mt-auto px-[22px] pt-4 border-t border-white/10">
          <div className="flex items-center gap-[7px] text-[11.5px] text-[#9FB0A5] mt-2">
            <span className="w-[6px] h-[6px] rounded-full bg-[#59C08A] shadow-[0_0_0_3px_rgba(89,192,138,0.18)]" />
            Database — connected
          </div>
          <div className="flex items-center gap-[7px] text-[11.5px] text-[#9FB0A5] mt-2">
            <span className="w-[6px] h-[6px] rounded-full bg-[#59C08A] shadow-[0_0_0_3px_rgba(89,192,138,0.18)]" />
            API — healthy, 42ms
          </div>
          <div className="flex items-center gap-[7px] text-[11.5px] text-[#9FB0A5] mt-2">
            <span className="w-[6px] h-[6px] rounded-full bg-[#E3B23C] shadow-[0_0_0_3px_rgba(227,178,60,0.18)]" />
            Sync queue — 1 pending
          </div>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between px-[30px] py-4 border-b border-rule bg-surface">
          <div>
            <h1 className="font-serif font-semibold text-[19px]">Overview</h1>
            <div className="text-xs text-muted mt-0.5">
              Tuesday, 28 July 2026 · All amounts in ₹
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-[20px] border border-rule-strong bg-surface text-muted">
              <span className="w-[6px] h-[6px] rounded-full bg-[#59C08A]" />
              All systems normal
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-[20px] border border-rule-strong bg-surface text-muted">
              Priya Sharma · Counter Staff
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-[30px] pb-[60px]">
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[26px]">
            <div className="bg-surface border border-rule rounded-lg px-[18px] py-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-green" />
              <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Total Revenue (MTD)</div>
              <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">₹4,82,340</div>
              <div className="text-[11.5px] mt-1.5 font-mono text-credit">↑ 6.2% vs last month</div>
            </div>
            <div className="bg-surface border border-rule rounded-lg px-[18px] py-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-debit" />
              <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Outstanding Balance</div>
              <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">₹63,120</div>
              <div className="text-[11.5px] mt-1.5 font-mono text-debit">↑ 12 unpaid invoices</div>
            </div>
            <div className="bg-surface border border-rule rounded-lg px-[18px] py-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-pending" />
              <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Low Stock Alerts</div>
              <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">5</div>
              <div className="text-[11.5px] mt-1.5 font-mono text-muted">items below threshold</div>
            </div>
            <div className="bg-surface border border-rule rounded-lg px-[18px] py-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-flag" />
              <div className="text-[11px] uppercase tracking-[0.09em] text-muted font-semibold">Unreconciled Entries</div>
              <div className="font-mono text-2xl font-semibold mt-2 tracking-tight">3</div>
              <div className="text-[11.5px] mt-1.5 font-mono text-muted">flagged for review</div>
            </div>
          </div>

          {/* Panels: Entry form + Ledger */}
          <div className="grid grid-cols-[400px_1fr] max-lg:grid-cols-1 gap-[18px] items-start">
            <TransactionForm />
            <div className="bg-surface border border-rule rounded-lg" id="ledger-panel">
              <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
                <div>
                  <div className="text-[10.5px] tracking-[0.1em] uppercase text-faint font-semibold">History</div>
                  <h2 className="font-serif font-semibold text-[15.5px]">Ledger</h2>
                </div>
              </div>
              <LedgerTable />
            </div>
          </div>

          {/* Low stock alert strip */}
          <div className="mt-[18px] bg-pending-bg border border-[#E4CE96] rounded-lg px-[18px] py-3.5 flex items-center gap-3.5">
            <div className="w-[30px] h-[30px] rounded-full bg-surface flex items-center justify-center text-[15px] flex-none border-[1.5px] border-pending text-pending font-bold">
              !
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[13.5px] text-[#7A5A17]">5 items are below their reorder threshold</div>
              <div className="text-xs text-[#8C7238] mt-0.5">Restock soon to avoid stockouts on your next sale.</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-surface border border-[#E4CE96] px-2.5 py-1 rounded-[14px] text-[11.5px] font-mono text-[#7A5A17]">Basmati Rice 5kg — 3 left</span>
              <span className="bg-surface border border-[#E4CE96] px-2.5 py-1 rounded-[14px] text-[11.5px] font-mono text-[#7A5A17]">Sunflower Oil 1L — 6 left</span>
              <span className="bg-surface border border-[#E4CE96] px-2.5 py-1 rounded-[14px] text-[11.5px] font-mono text-[#7A5A17]">Toor Dal 1kg — 4 left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
