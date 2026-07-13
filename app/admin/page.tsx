"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Activity, Search, Trash2, ShieldAlert, Calendar, Phone,
    MapPin, Droplet, LogOut, Edit3, X, Users, Pill, DollarSign,
    PlusCircle, CheckCircle2, AlertOctagon
} from "lucide-react";

type DeptType = "patients" | "appointments" | "pharmacy" | "financial";

export default function AdministrativeConsole() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<DeptType>("patients");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Master Relational Repositories
    const [patients, setPatients] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [pharmacy, setPharmacy] = useState<any[]>([]);
    const [financial, setFinancial] = useState<any[]>([]);

    // State Controls for Side Panel Forms
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const [isLoading, setIsLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        refreshServerMetrics();
    }, []);

    const refreshServerMetrics = async () => {
        try {
            const pData = await fetch("/api/admin?dept=patients").then(r => r.json());
            const aData = await fetch("/api/admin?dept=appointments").then(r => r.json());
            const phData = await fetch("/api/admin?dept=pharmacy").then(r => r.json());
            const fData = await fetch("/api/admin?dept=financial").then(r => r.json());

            if (!pData.error) setPatients(pData);
            if (!aData.error) setAppointments(aData);
            if (!phData.error) setPharmacy(phData);
            if (!fData.error) setFinancial(fData);

            const initialArray = activeTab === "patients" ? pData : activeTab === "appointments" ? aData : activeTab === "pharmacy" ? phData : fData;
            if (initialArray && initialArray.length > 0) {
                setSelectedItem(initialArray[0]);
            }
        } catch (err) {
            console.error("Administrative matrix synchronization fault:", err);
        }
    };

    const handleTabChange = (tab: DeptType) => {
        setActiveTab(tab);
        setSearchQuery("");
        clearFormFields();

        const targetSet = tab === "patients" ? patients : tab === "appointments" ? appointments : tab === "pharmacy" ? pharmacy : financial;
        setSelectedItem(targetSet.length > 0 ? targetSet[0] : null);
    };

    const clearFormFields = () => {
        setIsEditMode(false);
        setFormData({});
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const method = isEditMode ? "PUT" : "POST";

        try {
            const res = await fetch(`/api/admin?dept=${activeTab}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            }).then(r => r.json());

            if (!res.error) {
                await refreshServerMetrics();
                setSelectedItem(res);
                clearFormFields();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = (item: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditMode(true);
        const normalized = { ...item };

        // Normalize clean date values to load correctly inside inputs
        if (item.dob) normalized.dob = item.dob.split("T")[0];
        if (item.appointmentDate) normalized.appointmentDate = item.appointmentDate.split("T")[0];
        if (item.expiryDate) normalized.expiryDate = item.expiryDate.split("T")[0];
        if (item.billDate) normalized.billDate = item.billDate.split("T")[0];

        setFormData(normalized);
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`ADMIN CONTROL OVERRIDE: Are you sure you want to permanently delete record row #${id}?`)) return;

        try {
            const res = await fetch(`/api/admin?dept=${activeTab}&id=${id}`, { method: "DELETE" }).then(r => r.json());
            if (res.success) {
                await refreshServerMetrics();
                setSelectedItem(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getActiveArray = () => {
        if (activeTab === "patients") return patients;
        if (activeTab === "appointments") return appointments;
        if (activeTab === "pharmacy") return pharmacy;
        return financial;
    };

    const filteredDataset = getActiveArray().filter((item: any) => {
        const term = searchQuery.toLowerCase().trim();
        const matchStr = `${item.id} ${item.name || ""} ${item.patientName || ""} ${item.patientId || ""} ${item.status || ""}`.toLowerCase();
        return matchStr.includes(term);
    });

    const totalRevenue = financial.filter(b => b.status === "Paid").reduce((s, i) => s + Number(i.amount), 0);
    const globalApptsCount = appointments.length;
    const uniquePatientsCount = patients.length;

    return (
        <div className="min-h-screen w-full bg-[#f3f4f6] text-slate-900 flex flex-col font-sans">

            {/* Top Banner Header Layout */}
            <header className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between sticky top-0 z-20 shadow-xs gap-4">
                <div className="flex items-center gap-2">
                    <Activity className="text-red-500" size={24} />
                    <span className="text-xl font-bold tracking-tight">Medi Core</span>
                    <span className="ml-2 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        Root Admin Control
                    </span>
                </div>

                {/* Core Segmented Switcher Header Control Selection Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                    {[
                        { id: "patients", label: "Patients", icon: Users },
                        { id: "appointments", label: "Appointments", icon: Calendar },
                        { id: "pharmacy", label: "Pharmacy", icon: Pill },
                        { id: "financial", label: "Financial Desk", icon: DollarSign }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => handleTabChange(tab.id as DeptType)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition cursor-pointer ${active ? "bg-white text-[#635bff] shadow-xs border border-slate-200/40" : "hover:text-slate-900"}`}>
                                <Icon size={14} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => { setIsLoggingOut(true); setTimeout(() => router.push("/"), 400); }} disabled={isLoggingOut} className="flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 px-3 py-1.5 text-xs font-semibold transition text-slate-600 active:scale-95 disabled:opacity-50 cursor-pointer">
                        <LogOut size={14} />
                        {isLoggingOut ? "Ending Session..." : "Log Out"}
                    </button>
                </div>
            </header>

            {/* Grid Container Setup View Workspace Workspace */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden max-w-7xl w-full mx-auto">

                {/* LEFT CONTAINER COMPONENT ROW PIECE (8 Columns) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Real-time Counter Grid Widgets */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3.5">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
                            <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Total Patients</span><div className="text-xl font-black text-slate-900">{uniquePatientsCount} Registered</div></div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3.5">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Calendar size={20} /></div>
                            <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Appointments Ledger</span><div className="text-xl font-black text-slate-900">{globalApptsCount} Slotted</div></div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3.5">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={20} /></div>
                            <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Cash Flow Settled</span><div className="text-xl font-black text-slate-900">${totalRevenue.toFixed(2)}</div></div>
                        </div>
                    </div>

                    {/* Directory Ledger Feed Core List */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col flex-1 max-h-[360px] overflow-hidden">
                        <div className="flex items-center justify-between mb-3 gap-4">
                            <h3 className="text-base font-bold text-slate-800 shrink-0 capitalize">{activeTab} Direct Master Rows</h3>
                            <div className="relative w-full max-w-xs">
                                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search active repository log lines..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs outline-none transition focus:border-[#635bff] focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 border border-slate-100 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-100 z-10">
                                    {activeTab === "patients" && (
                                        <tr><th className="p-3">ID</th><th className="p-3">Patient Name</th><th className="p-3">Blood Type</th><th className="p-3">Contact</th><th className="p-3">City Address</th><th className="p-3 text-center">Actions</th></tr>
                                    )}
                                    {activeTab === "appointments" && (
                                        <tr><th className="p-3">Appt ID</th><th className="p-3">Patient UID</th><th className="p-3">Doctor ID</th><th className="p-3">Date/Time</th><th className="p-3">Status</th><th className="p-3 text-center">Actions</th></tr>
                                    )}
                                    {activeTab === "pharmacy" && (
                                        <tr><th className="p-3">Item ID</th><th className="p-3">Medicine Formulation Name</th><th className="p-3">Quantity</th><th className="p-3">Unit Price</th><th className="p-3 text-center">Actions</th></tr>
                                    )}
                                    {activeTab === "financial" && (
                                        <tr><th className="p-3">Bill ID</th><th className="p-3">Patient UID</th><th className="p-3">Bill Date</th><th className="p-3">Amount Due</th><th className="p-3">Standing</th><th className="p-3 text-center">Actions</th></tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredDataset.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-8 text-slate-400">No active tracking records fit input matchers.</td></tr>
                                    ) : (
                                        filteredDataset.map((item: any) => (
                                            <tr key={item.id} onClick={() => setSelectedItem(item)} className={`cursor-pointer transition ${selectedItem?.id === item.id ? "bg-red-500/5 border-l-2 border-l-red-500 font-medium" : "hover:bg-slate-50"}`}>

                                                {activeTab === "patients" && (
                                                    <>
                                                        <td className="p-3 text-slate-400 font-mono">#{item.id}</td>
                                                        <td className="p-3 text-slate-900 font-bold">{item.name}</td>
                                                        <td className="p-3"><span className="px-1.5 py-0.5 bg-red-50 text-red-600 font-bold text-[10px] rounded border border-red-100">{item.bloodGroup}</span></td>
                                                        <td className="p-3 text-slate-600 font-mono">{item.contact}</td>
                                                        <td className="p-3 text-slate-500">{item.address}</td>
                                                    </>
                                                )}
                                                {activeTab === "appointments" && (
                                                    <>
                                                        <td className="p-3 text-slate-400 font-mono">#{item.id}</td>
                                                        <td className="p-3 text-slate-700 font-semibold">Patient #{item.patientId}</td>
                                                        <td className="p-3 text-slate-600 font-mono">Doc #{item.doctorId}</td>
                                                        <td className="p-3 text-slate-500 font-medium">{item.appointmentDate?.split("T")[0]} ({item.appointmentTime})</td>
                                                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${item.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>{item.status}</span></td>
                                                    </>
                                                )}
                                                {activeTab === "pharmacy" && (
                                                    <>
                                                        <td className="p-3 text-slate-400 font-mono">#{item.id}</td>
                                                        <td className="p-3 text-slate-900 font-bold">{item.name}</td>
                                                        <td className={`p-3 font-bold ${Number(item.quantity) === 0 ? "text-red-500" : "text-slate-600"}`}>{Number(item.quantity) === 0 ? "0 (OUT)" : `${item.quantity} units`}</td>
                                                        <td className="p-3 font-bold text-slate-900">${Number(item.price).toFixed(2)}</td>
                                                    </>
                                                )}
                                                {activeTab === "financial" && (
                                                    <>
                                                        <td className="p-3 text-slate-400 font-mono">#{item.id}</td>
                                                        <td className="p-3 text-slate-700">Patient File #{item.patientId}</td>
                                                        <td className="p-3 text-slate-500">{item.billDate?.split("T")[0]}</td>
                                                        <td className="p-3 font-black text-slate-900">${Number(item.amount).toFixed(2)}</td>
                                                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${item.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>{item.status}</span></td>
                                                    </>
                                                )}

                                                <td className="p-3 text-center flex justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                                                    <button onClick={(e) => startEditing(item, e)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"><Edit3 size={13} /></button>
                                                    <button onClick={(e) => handleDelete(item.id, e)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"><Trash2 size={13} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* LOWER DISPLAY INSPECTOR PANEL */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-1">
                        {selectedItem ? (
                            <div>
                                <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                                    <div>
                                        <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded tracking-wider">
                                            DATA OVERRIDE INSPECTOR CARD #{selectedItem.id}
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-900 mt-1 capitalize">{activeTab} File Dossier</h3>
                                    </div>
                                    <div className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-medium">
                                        Created: {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : "System Initialized"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                    {activeTab === "patients" && (
                                        <>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Full Name</span><div className="font-bold text-slate-800 text-sm">{selectedItem.name}</div></div>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Date of Birth (DOB)</span><div className="font-semibold text-slate-800">{selectedItem.dob?.split("T")[0]}</div></div>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Biological Gender</span><div className="font-semibold text-slate-800">{selectedItem.gender}</div></div>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Primary Contact Line</span><div className="font-mono text-slate-700 font-bold">{selectedItem.contact}</div></div>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Blood Classification</span><div className="font-bold text-red-600">{selectedItem.bloodGroup}</div></div>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Residential City</span><div className="font-medium text-slate-700">{selectedItem.address}</div></div>
                                        </>
                                    )}

                                    {activeTab === "appointments" && (
                                        <>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Patient Reference ID</span><div className="font-bold text-slate-800 font-mono">UID #{selectedItem.patientId}</div></div>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Practitioner Doctor ID</span><div className="font-bold text-slate-800 font-mono">DOC #{selectedItem.doctorId}</div></div>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Date & Time Matrix</span><div className="font-semibold text-slate-800">{selectedItem.appointmentDate?.split("T")[0]} at {selectedItem.appointmentTime}</div></div>
                                        </>
                                    )}

                                    {activeTab === "pharmacy" && (
                                        <>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Medicine Formulation</span><div className="font-bold text-slate-800 text-sm">{selectedItem.name}</div></div>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Stock Reserves Availability</span><div className="font-bold text-slate-800">{selectedItem.quantity} Packs</div></div>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Unit Package Cost Price</span><div className="font-bold text-emerald-600">${Number(selectedItem.price).toFixed(2)}</div></div>
                                            <div className="sm:col-span-3 border-t pt-2 mt-1"><span className="text-slate-400 text-[10px] font-bold uppercase block mb-0.5">Chemical Safety Expiry Target</span><div className="font-semibold text-red-600 font-mono">Expires on: {selectedItem.expiryDate?.split("T")[0]}</div></div>
                                        </>
                                    )}

                                    {activeTab === "financial" && (
                                        <>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Target Billing Patient</span><div className="font-bold text-slate-800">Patient Ref #{selectedItem.patientId}</div></div>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Statement Due Date</span><div className="font-semibold text-slate-700">{selectedItem.billDate?.split("T")[0]}</div></div>
                                            <div><span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Total Balance Valuation</span><div className="font-black text-slate-900 text-sm">${Number(selectedItem.amount).toFixed(2)}</div></div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
                                <ShieldAlert size={32} className="stroke-1 mb-1" />
                                <p className="text-xs">Select an operational repository table row ledger line to engage data core mapping previews.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL DATA WRITING REGISTRY INPUT FORM (4 Columns) */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-fit">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <PlusCircle className="text-[#635bff]" size={20} />
                            <h2 className="text-base font-bold text-slate-800 capitalize">
                                {isEditMode ? `Override ${activeTab}` : `${activeTab} Registry`}
                            </h2>
                        </div>
                        {isEditMode && (
                            <button onClick={clearFormFields} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"><X size={16} /></button>
                        )}
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-4">

                        {activeTab === "patients" && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Full Name</label>
                                    <input type="text" required placeholder="Tharindu Nirmal" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#635bff]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth (DOB)</label>
                                    <input type="date" required value={formData.dob || ""} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#635bff]" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                                        <input type="text" required placeholder="Male" value={formData.gender || ""} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Group</label>
                                        <input type="text" required placeholder="A+" value={formData.bloodGroup || ""} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none uppercase font-bold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone</label>
                                    <input type="text" required placeholder="0703814047" value={formData.contact || ""} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">City Address</label>
                                    <input type="text" required placeholder="Buttala" value={formData.address || ""} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
                                </div>
                            </>
                        )}

                        {activeTab === "appointments" && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Patient ID</label>
                                        <input type="number" required placeholder="1" value={formData.patientId || ""} onChange={e => setFormData({ ...formData, patientId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor ID</label>
                                        <input type="number" required placeholder="101" value={formData.doctorId || ""} onChange={e => setFormData({ ...formData, doctorId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none font-mono" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Appointment Date</label>
                                    <input type="date" required value={formData.appointmentDate || ""} onChange={e => setFormData({ ...formData, appointmentDate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Appointment Time</label>
                                    <input type="text" required placeholder="10:57:00" value={formData.appointmentTime || ""} onChange={e => setFormData({ ...formData, appointmentTime: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status Check</label>
                                    <select value={formData.status || "Scheduled"} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {activeTab === "pharmacy" && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Medicine Formulation Name</label>
                                    <input type="text" required placeholder="Amoxicillin 500mg" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity Count</label>
                                        <input type="number" required placeholder="100" value={formData.quantity !== undefined ? formData.quantity : ""} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Unit Pricing ($)</label>
                                        <input type="number" step="0.01" required placeholder="100.00" value={formData.price || ""} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry Date Target</label>
                                    <input type="date" required value={formData.expiryDate || ""} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none" />
                                </div>
                            </>
                        )}

                        {activeTab === "financial" && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Client reference ID</label>
                                    <input type="number" required placeholder="1" value={formData.patientId || ""} onChange={e => setFormData({ ...formData, patientId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Total Pricing Amount ($)</label>
                                    <input type="number" step="0.01" required placeholder="2500.00" value={formData.amount || ""} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Bill Statement Date</label>
                                    <input type="date" required value={formData.billDate || ""} onChange={e => setFormData({ ...formData, billDate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Settlement Status</label>
                                    <select value={formData.status || "Paid"} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                                        <option value="Unpaid">Unpaid / Processing</option>
                                        <option value="Paid">Paid / Settled</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-50 mt-2 cursor-pointer uppercase tracking-wider font-mono"
                        >
                            {isLoading ? "Writing Record Matrix..." : isEditMode ? "Commit Amendments" : `Add New ${activeTab}`}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}