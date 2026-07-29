'use client';

import LedgerTable from "@/components/LedgerTable";

export default function LedgerPage() {
  return (
    <>
      <div className="flex items-center justify-between px-[30px] py-4 border-b border-rule bg-surface">
        <div>
          <h1 className="font-serif font-semibold text-[19px]">Ledger</h1>
          <div className="text-xs text-muted mt-0.5">
            General ledger — all transactions
          </div>
        </div>
      </div>
      <div className="flex-1 p-[30px] pb-[60px]">
        <div className="bg-surface border border-rule rounded-lg">
          <LedgerTable />
        </div>
      </div>
    </>
  );
}
