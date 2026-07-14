"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, DollarSign, Receipt, CreditCard, ShieldAlert, Trash2, Edit3, LogOut, X, TrendingUp, CheckCircle, Clock } from "lucide-react";

interface Bill {
    id: number;
    patientId: number;
    amount: number;
    billDate: string;
    status: string;
}

export default function FinancialManagement() {
    const router = useRouter();
    const [bills, setBills] = useState<Bill[]>([]);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

    // Billing Generator States
    const [patientId, setPatientId] = useState("");
    const [amount, setAmount] = useState("");
    const [billDate, setBillDate] = useState("");
    const [status, setStatus] = useState("Unpaid");

    // Edit / Adjustment Modal States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editPatientId, setEditPatientId] = useState("");
    const [editAmount, setEditAmount] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editStatus, setEditStatus] = useState("Unpaid");

    const [isLoading, setIsLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await fetch("/api/financial");
            const data = await res.json();
            if (!data.error) {
                setBills(data);
                if (data.length > 0 && !selectedBill) {
                    setSelectedBill(data[0]);
                }
            }
        } catch (err) {
            console.error("Failure query transactions list", err);
        }
    };

    const handleGenerateBill = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const payload = { patientId, amount, billDate, status };

        try {
            const res = await fetch("/api/financial", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const newBill = await res.json();
            if (!newBill.error) {
                setBills([newBill, ...bills]);
                setSelectedBill(newBill);
                setPatientId(""); setAmount(""); setBillDate("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateBill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editId) return;

        const payload = { id: editId, patientId: Number(editPatientId), amount: Number(editAmount), billDate: editDate, status: editStatus };

        try {
            const res = await fetch("/api/financial", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const updated = await res.json();
            if (!updated.error) {
                const freshList = bills.map((b) => (b.id === editId ? updated : b));
                setBills(freshList);
                setSelectedBill(updated);
                setIsEditOpen(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteBill = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to void and eliminate this billing invoice record permanently?")) return;

        try {
            const res = await fetch(`/api/financial?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                const updatedList = bills.filter((b) => b.id !== id);
                setBills(updatedList);
                if (selectedBill?.id === id) {
                    setSelectedBill(updatedList.length > 0 ? updatedList[0] : null);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Telemetry Aggregates (Total Revenue Calculation Rules)
    const totalRevenue = bills
        .filter((b) => b.status === "Paid")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const pendingReceivables = bills
        .filter((b) => b.status === "Unpaid")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const openEditModal = (bill: Bill) => {
        setEditId(bill.id);
        setEditPatientId(bill.patientId.toString());
        setEditAmount(bill.amount.toString());
        setEditDate(bill.billDate.split("T")[0]);
        setEditStatus(bill.status);
        setIsEditOpen(true);
    };

    return (
        <div className="min-h-screen w-full bg-[#f3f4f6] text-slate-900 flex flex-col font-sans">

            {/* Navigation Banner */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
                <div className="flex items-center gap-2">
                    <Activity className="text-[#635bff]" size={24} />
                    <span className="text-xl font-bold tracking-tight">Medi Core</span>
                    <span className="ml-2 bg-[#635bff]/10 text-[#635bff] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        Financial Terminal
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-slate-400 hidden sm:inline">Terminal Operational</span>
                    <div className="h-4 w-px bg-slate-200 hidden sm:inline" />
                    <button onClick={() => { setIsLoggingOut(true); setTimeout(() => router.push("/"), 400); }} disabled={isLoggingOut} className="flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 px-3 py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-50">
                        <LogOut size={14} />
                        {isLoggingOut ? "Ending Session..." : "Log Out"}
                    </button>
                </div>
            </header>

            {/* Main Grid Workspace */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden max-w-7xl w-full mx-auto">

                {/* LEFT COLUMN: Revenue Breakdowns & Financial Ledgers (8 Columns) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Executive Telemetry Revenue Metrics Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={24} /></div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Gross Settled Revenue</span>
                                <span className="text-2xl font-black text-slate-900">${totalRevenue.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={24} /></div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Pending Receivables</span>
                                <span className="text-2xl font-black text-slate-900">${pendingReceivables.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Master Transaction Invoices Log Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col flex-1 max-h-[320px] overflow-hidden">
                        <h3 className="text-base font-bold text-slate-800 mb-3">Accounts Transaction Ledger</h3>

                        <div className="overflow-y-auto flex-1 border border-slate-100 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-100">
                                    <tr>
                                        <th className="p-3">Invoice ID</th>
                                        <th className="p-3">Patient Card</th>
                                        <th className="p-3">Statement Date</th>
                                        <th className="p-3">Amount Due</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {bills.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-8 text-slate-400">No active balance transactions written into local database tables.</td></tr>
                                    ) : (
                                        bills.map((bill) => (
                                            <tr key={bill.id} onClick={() => setSelectedBill(bill)} className={`cursor-pointer transition ${selectedBill?.id === bill.id ? "bg-[#635bff]/5 font-medium border-l-2 border-l-[#635bff]" : "hover:bg-slate-50"}`}>
                                                <td className="p-3 text-slate-400 font-mono">#{bill.id}</td>
                                                <td className="p-3 font-semibold text-slate-900">Patient Reference #{bill.patientId}</td>
                                                <td className="p-3 text-slate-500">{bill.billDate.split("T")[0]}</td>
                                                <td className="p-3 text-slate-800 font-bold">${Number(bill.amount).toFixed(2)}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${bill.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>{bill.status}</span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button onClick={(e) => handleDeleteBill(bill.id, e)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"><Trash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* LOWER COMPONENT: Inspected Transaction Telemetry Dossier View */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-1">
                        {selectedBill ? (
                            <div>
                                <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                                    <div>
                                        <span className="text-xs font-mono font-bold text-[#635bff] bg-[#635bff]/10 px-2 py-0.5 rounded">BILL STATEMENT ACCOUNTS #{selectedBill.id}</span>
                                        <h3 className="text-xl font-bold text-slate-900 mt-1">Patient Invoice Audit Stream</h3>
                                    </div>
                                    <button onClick={() => openEditModal(selectedBill)} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"><Edit3 size={13} /> Adjust Entry Values</button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2"><Receipt size={16} className="text-slate-400" /><div><div className="text-slate-400 font-medium text-[9px]">DEBTOR ACCOUNT CODE</div><div className="font-bold text-slate-800">Patient Account #{selectedBill.patientId}</div></div></div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2"><DollarSign size={16} className="text-slate-400" /><div><div className="text-slate-400 font-medium text-[9px]">TOTAL VALUATION</div><div className="font-bold text-slate-900">${Number(selectedBill.amount).toFixed(2)}</div></div></div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2"><CreditCard size={16} className="text-slate-400" /><div><div className="text-slate-400 font-medium text-[9px]">SETTLEMENT STANDING</div><div className="font-bold text-slate-800">{selectedBill.status}</div></div></div>
                                </div>

                                <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex items-center gap-2">
                                    <CheckCircle size={15} className="text-emerald-500" />
                                    <span className="text-slate-600">The billing system securely committed this transaction matrix log on <strong>{selectedBill.billDate.split("T")[0]}</strong>.</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400"><ShieldAlert size={36} className="stroke-1 mb-2" /><p className="text-xs">Select a row block item within the ledger index view to output structural telemetry graphs.</p></div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Generate Bill Billing Input Panel Box (4 Columns) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-fit">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="text-[#635bff]" size={20} />
                        <h2 className="text-base font-bold text-slate-800">Generate Statement Invoice</h2>
                    </div>

                    <form onSubmit={handleGenerateBill} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Patient System ID</label>
                            <input type="number" required placeholder="e.g. 1" value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#635bff]" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Total Fee Amount Due ($)</label>
                            <input type="number" step="0.01" required placeholder="e.g. 250.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#635bff]" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Statement Creation Date</label>
                            <input type="date" required value={billDate} onChange={(e) => setBillDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#635bff]" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Status Standing</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none">
                                <option value="Unpaid">Unpaid / Pending</option>
                                <option value="Paid">Paid / Settled</option>
                            </select>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[#635bff] py-2.5 text-xs font-semibold text-white shadow-md shadow-[#635bff]/10 transition hover:bg-[#5249e0] cursor-pointer">
                            {isLoading ? "Writing to Database..." : "Commit Generated Invoice"}
                        </button>
                    </form>
                </div>

            </div>

            {/* DYNAMIC RECORD BATCH ADJUSTMENT OVERLAY MODAL */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl max-w-sm w-full relative">
                        <button onClick={() => setIsEditOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"><X size={18} /></button>

                        <div className="flex items-center gap-2 mb-4">
                            <Edit3 className="text-[#635bff]" size={20} />
                            <h3 className="text-base font-bold text-slate-800">Adjust Bill Specifications #{editId}</h3>
                        </div>

                        <form onSubmit={handleUpdateBill} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-600 mb-1">Debtor Patient System ID</label>
                                <input type="number" required value={editPatientId} onChange={(e) => setEditPatientId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#635bff]" />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-600 mb-1">Total Due Fee Amount ($)</label>
                                <input type="number" step="0.01" required value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#635bff]" />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-600 mb-1">Statement Date</label>
                                <input type="date" required value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none" />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-600 mb-1">Update Status Standing</label>
                                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none">
                                    <option value="Unpaid">Unpaid / Pending</option>
                                    <option value="Paid">Paid / Settled</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition">Dismiss</button>
                                <button type="submit" className="px-4 py-2 font-semibold text-white bg-[#635bff] hover:bg-[#5249e0] rounded-xl transition shadow-md">Apply Amendments</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}