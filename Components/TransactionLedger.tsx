import { Trash2 } from "lucide-react";

interface Invoice {
  id: string;
  patientCard: string;
  statementDate: string;
  amountDue: string;
  status: "Paid" | "Unpaid" | "Pending";
}

const invoices: Invoice[] = [
  {
    id: "#1",
    patientCard: "Patient Reference #1",
    statementDate: "2026-06-24",
    amountDue: "$2500.00",
    status: "Paid",
  },
];

function StatusPill({ status }: { status: Invoice["status"] }) {
  const styles: Record<Invoice["status"], string> = {
    Paid: "bg-emerald-50 text-emerald-600",
    Unpaid: "bg-amber-50 text-amber-600",
    Pending: "bg-amber-50 text-amber-600",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function TransactionLedger() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-gray-900">
        Accounts Transaction Ledger
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed text-left">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th className="w-28 pb-3">Invoice ID</th>
              <th className="pb-3">Patient Card</th>
              <th className="pb-3">Statement Date</th>
              <th className="pb-3">Amount Due</th>
              <th className="w-24 pb-3">Status</th>
              <th className="w-20 pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-gray-100 text-sm">
                <td className="py-4 pl-3 text-gray-500">{inv.id}</td>
                <td className="py-4 font-medium text-gray-900">{inv.patientCard}</td>
                <td className="py-4 text-gray-500">{inv.statementDate}</td>
                <td className="py-4 font-semibold text-gray-900">{inv.amountDue}</td>
                <td className="py-4">
                  <StatusPill status={inv.status} />
                </td>
                <td className="py-4 text-right">
                  <button className="text-gray-400 hover:text-red-500" aria-label={`Delete invoice ${inv.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}