'use client';

import { useState } from 'react';
import TransactionForm from "@/components/TransactionForm";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const handleSuccess = () => {
    setSubmitted(true);
    setTimeout(() => router.push("/"), 1500);
  };

  if (submitted) {
    return (
      <>
        <div className="flex items-center justify-between px-[30px] py-4 border-b border-rule bg-surface">
          <div>
            <h1 className="font-serif font-semibold text-[19px]">New Transaction</h1>
            <div className="text-xs text-muted mt-0.5">Recording a new entry</div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-credit-bg flex items-center justify-center text-credit text-2xl mx-auto mb-3">✓</div>
            <div className="font-semibold text-ink">Transaction posted successfully</div>
            <div className="text-xs mt-1">Redirecting to dashboard...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-[30px] py-4 border-b border-rule bg-surface">
        <div>
          <h1 className="font-serif font-semibold text-[19px]">New Transaction</h1>
          <div className="text-xs text-muted mt-0.5">Record a sale or purchase with double-entry posting</div>
        </div>
      </div>
      <div className="flex-1 p-[30px] pb-[60px] max-w-[600px]">
        <TransactionForm onSuccess={handleSuccess} />
      </div>
    </>
  );
}
