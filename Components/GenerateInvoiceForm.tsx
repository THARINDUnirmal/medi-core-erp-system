"use client";

import { FileText, Calendar } from "lucide-react";
import { useState } from "react";

export default function GenerateInvoiceForm() {
  const [patientId, setPatientId] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [creationDate, setCreationDate] = useState("");
  const [status, setStatus] = useState("Unpaid / Pending");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log({ patientId, feeAmount, creationDate, status });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <FileText className="h-5 w-5 text-indigo-600" />
        <h2 className="text-base font-bold text-gray-900">
          Generate Statement Invoice
        </h2>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Target Patient System ID
          </label>
          <input
            type="text"
            placeholder="e.g. 1"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Total Fee Amount Due ($)
          </label>
          <input
            type="text"
            placeholder="e.g. 250.00"
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Statement Creation Date
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              value={creationDate}
              onChange={(e) => setCreationDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <Calendar className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Initial Status Standing
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option>Unpaid / Pending</option>
            <option>Paid</option>
            <option>Overdue</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Commit Generated Invoice
        </button>
      </form>
    </div>
  );
}