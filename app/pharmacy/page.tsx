"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, Pill, DollarSign, Package, ShieldAlert, Trash2, Edit3, LogOut, X, AlertOctagon, TrendingDown, ClipboardCheck } from "lucide-react";

interface Medicine {
    id: number;
    name: string;
    quantity: number;
    expiryDate: string;
    price: number;
}

export default function PharmacyManagement() {
    const router = useRouter();
    const [inventory, setInventory] = useState<Medicine[]>([]);
    const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);

    // New Drug Intake Form States
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [price, setPrice] = useState("");

    // Edit/Modify Modal Overlay States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editQty, setEditQty] = useState("");
    const [editExpiry, setEditExpiry] = useState("");
    const [editPrice, setEditPrice] = useState("");

    // Dispensing / Issue Interaction Counter
    const [issueQty, setIssueQty] = useState("1");

    const [isLoading, setIsLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await fetch("/api/pharmacy");
            const data = await res.json();
            if (!data.error) {
                setInventory(data);
                if (data.length > 0 && !selectedMed) {
                    setSelectedMed(data[0]);
                }
            }
        } catch (err) {
            console.error("Failure fetching pharmacy inventory array", err);
        }
    };

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const payload = { name, quantity, expiryDate, price };

        try {
            const res = await fetch("/api/pharmacy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const newMed = await res.json();
            if (!newMed.error) {
                setInventory([newMed, ...inventory]);
                setSelectedMed(newMed);
                setName(""); setQuantity(""); setExpiryDate(""); setPrice("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleIssueMedicine = async () => {
        if (!selectedMed) return;
        const itemsToDispense = Number(issueQty);
        if (itemsToDispense > selectedMed.quantity) {
            alert("Insufficient batch counts available within local stores!");
            return;
        }

        const updatedQty = selectedMed.quantity - itemsToDispense;
        const payload = { ...selectedMed, expiryDate: selectedMed.expiryDate.split("T")[0], quantity: updatedQty };

        try {
            const res = await fetch("/api/pharmacy", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const updated = await res.json();
            if (!updated.error) {
                setInventory(inventory.map((m) => (m.id === selectedMed.id ? updated : m)));
                setSelectedMed(updated);
                setIssueQty("1");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openEditModal = (med: Medicine) => {
        setEditId(med.id);
        setEditName(med.name);
        setEditQty(med.quantity.toString());
        setEditExpiry(med.expiryDate.split("T")[0]);
        setEditPrice(med.price.toString());
        setIsEditOpen(true);
    };

    const handleUpdateMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editId) return;

        const payload = { id: editId, name: editName, quantity: Number(editQty), expiryDate: editExpiry, price: Number(editPrice) };

        try {
            const res = await fetch("/api/pharmacy", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const updated = await res.json();
            if (!updated.error) {
                const freshList = inventory.map((m) => (m.id === editId ? updated : m));
                setInventory(freshList);
                setSelectedMed(updated);
                setIsEditOpen(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteMedicine = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to permanently scrap this pharmaceutical stock row?")) return;

        try {
            const res = await fetch(`/api/pharmacy?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                const updatedList = inventory.filter((m) => m.id !== id);
                setInventory(updatedList);
                if (selectedMed?.id === id) {
                    setSelectedMed(updatedList.length > 0 ? updatedList[0] : null);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Logic checks for indicators
    const checkIsOutOfStock = (qty: number) => qty === 0;
    const checkIsLowStock = (qty: number) => qty > 0 && qty <= 15;

    const checkIsNearExpiry = (dateStr: string) => {
        const expDate = new Date(dateStr);
        const today = new Date();
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 60; // Flag alerts inside a 60-day window
    };

    return (
        <div className="min-h-screen w-full bg-[#f3f4f6] text-slate-900 flex flex-col font-sans">

            {/* Top Professional Navigation Banner */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
                <div className="flex items-center gap-2">
                    <Activity className="text-[#635bff]" size={24} />
                    <span className="text-xl font-bold tracking-tight">Medi Core</span>
                    <span className="ml-2 bg-[#635bff]/10 text-[#635bff] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        Pharmacy Dispensary
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

                {/* LEFT SECTOR: Medicine Storage Matrix Index View (8 Columns) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col flex-1 max-h-[380px] overflow-hidden">
                        <h3 className="text-base font-bold text-slate-800 mb-3">Pharmacy Stock Inventory</h3>

                        <div className="overflow-y-auto flex-1 border border-slate-100 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-100">
                                    <tr>
                                        <th className="p-3">Ref ID</th>
                                        <th className="p-3">Item Name</th>
                                        <th className="p-3">Quantity</th>
                                        <th className="p-3">Expiry Date</th>
                                        <th className="p-3">Price</th>
                                        <th className="p-3 text-center">Indicators</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {inventory.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-8 text-slate-400">Dispensary vaults are currently empty. Registered items will populate here.</td></tr>
                                    ) : (
                                        inventory.map((med) => {
                                            const outOfStock = checkIsOutOfStock(med.quantity);
                                            const lowStock = checkIsLowStock(med.quantity);
                                            const nearExp = checkIsNearExpiry(med.expiryDate);

                                            return (
                                                <tr key={med.id} onClick={() => setSelectedMed(med)} className={`cursor-pointer transition ${selectedMed?.id === med.id ? "bg-[#635bff]/5 font-medium border-l-2 border-l-[#635bff]" : "hover:bg-slate-50"}`}>
                                                    <td className="p-3 text-slate-400 font-mono">#{med.id}</td>
                                                    <td className="p-3 font-semibold text-slate-900">{med.name}</td>
                                                    <td className={`p-3 font-medium ${outOfStock ? "text-red-600 font-bold" : "text-slate-700"}`}>
                                                        {outOfStock ? "0 units" : `${med.quantity} units`}
                                                    </td>
                                                    <td className="p-3 text-slate-500">{med.expiryDate.split("T")[0]}</td>
                                                    <td className="p-3 text-slate-800 font-medium">${Number(med.price).toFixed(2)}</td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            {outOfStock && <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded text-[9px] tracking-wide animate-pulse">OUT OF STOCK</span>}
                                                            {lowStock && <span className="bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded text-[9px] tracking-wide">LOW STOCK</span>}
                                                            {nearExp && <span className="bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded text-[9px] tracking-wide">EXPIRING</span>}
                                                            {!outOfStock && !lowStock && !nearExp && <span className="text-emerald-600 font-bold text-[10px]">Stable</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <button onClick={(e) => handleDeleteMedicine(med.id, e)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"><Trash2 size={14} /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* LOWER SECTOR: Selected Profile Detailed Metrics Dashboard Panel & Issuance Station */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-1">
                        {selectedMed ? (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                                {/* Information Visuals */}
                                <div className="md:col-span-7 space-y-4">
                                    <div>
                                        <span className="text-xs font-mono font-bold text-[#635bff] bg-[#635bff]/10 px-2 py-0.5 rounded">PHARMACEUTICAL INDEX LOG #{selectedMed.id}</span>
                                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{selectedMed.name}</h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 text-xs">
                                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><Package size={14} className="text-slate-400 mb-1" /><div><div className="text-slate-400 font-medium text-[9px]">AVAILABLE BAL</div><div className={`font-bold ${selectedMed.quantity === 0 ? "text-red-600" : "text-slate-800"}`}>{selectedMed.quantity} units</div></div></div>
                                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><AlertOctagon size={14} className="text-slate-400 mb-1" /><div><div className="text-slate-400 font-medium text-[9px]">EXPIRY DATE</div><div className="font-bold text-slate-800">{selectedMed.expiryDate.split("T")[0]}</div></div></div>
                                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><DollarSign size={14} className="text-slate-400 mb-1" /><div><div className="text-slate-400 font-medium text-[9px]">UNIT COST</div><div className="font-bold text-slate-800">${Number(selectedMed.price).toFixed(2)}</div></div></div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(selectedMed)} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"><Edit3 size={13} /> Update Asset Records</button>
                                    </div>
                                </div>

                                {/* ACTIVE DISPENSARY TRANSACTION STATION */}
                                <div className="md:col-span-5 bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                            <ClipboardCheck size={14} className="text-[#635bff]" />
                                            <span>Issue Medicine Station</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">Deduct items straight out of server balances when checking out a patient script prescription.</p>

                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-slate-600">Deduction Quantity Count</label>
                                            <input type="number" min="1" max={selectedMed.quantity || 1} disabled={selectedMed.quantity === 0} value={issueQty} onChange={(e) => setIssueQty(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#635bff] disabled:bg-slate-100" />
                                        </div>
                                    </div>

                                    <button onClick={handleIssueMedicine} disabled={selectedMed.quantity === 0} className="w-full mt-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 shadow-sm transition disabled:opacity-50 disabled:bg-slate-400 cursor-pointer">
                                        {selectedMed.quantity === 0 ? "Stock Exhausted" : "Dispense & Deduct Stock"}
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400"><ShieldAlert size={36} className="stroke-1 mb-2" /><p className="text-xs">Select a pharmaceutical asset card row to access structural logging systems.</p></div>
                        )}
                    </div>
                </div>

                {/* RIGHT SECTOR: Dynamic Stock Alert Lists & New Drug Registry Card Intake (4 Columns) */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Add New Stock Entry Asset Input Form Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-fit">
                        <div className="flex items-center gap-2 mb-4">
                            <Pill className="text-[#635bff]" size={20} />
                            <h2 className="text-base font-bold text-slate-800">Add New Medicine</h2>
                        </div>

                        <form onSubmit={handleAddMedicine} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Medicine Title/Name</label>
                                <input type="text" required placeholder="e.g. Amoxicillin 500mg" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#635bff]" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Batch Qty</label>
                                    <input type="number" required placeholder="e.g. 100" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#635bff]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Unit Price ($)</label>
                                    <input type="number" step="0.01" required placeholder="e.g. 12.50" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#635bff]" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Expiration Target Date</label>
                                <input type="date" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#635bff]" />
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[#635bff] py-2.5 text-xs font-semibold text-white shadow-md shadow-[#635bff]/10 transition hover:bg-[#5249e0] cursor-pointer">
                                {isLoading ? "Writing to Database..." : "Log Asset Into Vault"}
                            </button>
                        </form>
                    </div>

                    {/* REALTIME SYSTEM HEALTH NOTIFICATION MONITORS */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 h-fit">

                        {/* Low / Out of Stock Inventory Monitor */}
                        <div>
                            <div className="flex items-center gap-1 mb-2 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                <TrendingDown size={14} />
                                <span>Critical Stock Alerts</span>
                            </div>
                            <div className="max-h-[110px] overflow-y-auto space-y-1.5">
                                {inventory.filter(m => m.quantity <= 15).length === 0 ? (
                                    <div className="text-[10px] text-slate-400 p-2 bg-slate-50 rounded-lg border border-slate-100">All local product stores remain fully supplied.</div>
                                ) : (
                                    inventory.filter(m => m.quantity <= 15).map(m => (
                                        <div key={m.id} className={`text-[11px] p-2 border rounded-lg flex justify-between items-center ${m.quantity === 0 ? "bg-red-50 border-red-200 text-red-800 font-semibold" : "bg-amber-50/60 border-amber-100 text-amber-800"}`}>
                                            <span>{m.name}</span>
                                            <span className="font-mono font-bold text-[10px]">{m.quantity === 0 ? "OUT" : `${m.quantity} left`}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Expiration Date Target Monitor */}
                        <div>
                            <div className="flex items-center gap-1 mb-2 text-[10px] font-bold text-red-600 uppercase tracking-wider">
                                <AlertOctagon size={14} />
                                <span>Vault Expiry Target Flags</span>
                            </div>
                            <div className="max-h-[110px] overflow-y-auto space-y-1.5">
                                {inventory.filter(m => checkIsNearExpiry(m.expiryDate)).length === 0 ? (
                                    <div className="text-[10px] text-slate-400 p-2 bg-slate-50 rounded-lg border border-slate-100">No active products require chemical rotation.</div>
                                ) : (
                                    inventory.filter(m => checkIsNearExpiry(m.expiryDate)).map(m => (
                                        <div key={m.id} className="text-[11px] p-2 bg-red-50/60 border border-red-100 rounded-lg flex justify-between items-center text-red-800">
                                            <span className="font-medium">{m.name}</span>
                                            <span className="font-mono font-bold text-[10px]">{m.expiryDate.split("T")[0]}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* COMPREHENSIVE BATCH EDIT OVERLAY MODAL */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl max-w-sm w-full relative">
                        <button onClick={() => setIsEditOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"><X size={18} /></button>

                        <div className="flex items-center gap-2 mb-4">
                            <Edit3 className="text-[#635bff]" size={20} />
                            <h3 className="text-base font-bold text-slate-800">Modify Vault Item #{editId}</h3>
                        </div>

                        <form onSubmit={handleUpdateMedicine} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-600 mb-1">Medicine Title Name</label>
                                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#635bff]" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-600 mb-1">Stock Quantity</label>
                                    <input type="number" required value={editQty} onChange={(e) => setEditQty(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#635bff]" />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 mb-1">Unit Price ($)</label>
                                    <input type="number" step="0.01" required value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#635bff]" />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-600 mb-1">Expiration Date</label>
                                <input type="date" required value={editExpiry} onChange={(e) => setEditExpiry(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none" />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition">Dismiss</button>
                                <button type="submit" className="px-4 py-2 font-semibold text-white bg-[#635bff] hover:bg-[#5249e0] rounded-xl transition shadow-md">Update Stock</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}