import { CreditCard, DollarSign, Pencil, SquareUser, CheckCircle2 } from "lucide-react";

export default function InvoiceAuditStream() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <span className="mb-2 inline-block rounded bg-indigo-50 px-2 py-1 text-[11px] font-bold tracking-wide text-indigo-600">
            BILL STATEMENT ACCOUNTS #1
          </span>
          <h2 className="text-xl font-bold text-gray-900">
            Patient Invoice Audit Stream
          </h2>
        </div>
        <button className="flex h-fit items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Pencil className="h-4 w-4" />
          Adjust Entry Values
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            <SquareUser className="h-4 w-4" />
            Debtor Account Code
          </div>
          <p className="text-sm font-bold text-gray-900">Patient Account #1</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            <DollarSign className="h-4 w-4" />
            Total Valuation
          </div>
          <p className="text-sm font-bold text-gray-900">$2500.00</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            <CreditCard className="h-4 w-4" />
            Settlement Standing
          </div>
          <p className="text-sm font-bold text-gray-900">Paid</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
        <span>
          The billing system securely committed this transaction matrix log on{" "}
          <span className="font-semibold text-gray-900">2026-06-24</span>.
        </span>
      </div>
    </div>
  );
}