"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, Search, UserPlus, Trash2, ShieldAlert, Calendar, Phone, MapPin, Droplet, LogOut, Edit3, X } from "lucide-react";

interface Patient {
    id: number;
    name: string;
    dob: string;
    gender: string;
    contact: string;
    address: string;
    bloodGroup: string;
}

export default function PatientManagement() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // Registration Form States
    const [name, setName] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("Male");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");
    const [bloodGroup, setBloodGroup] = useState("A+");

    // Edit Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editDob, setEditDob] = useState("");
    const [editGender, setEditGender] = useState("Male");
    const [editContact, setEditContact] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editBloodGroup, setEditBloodGroup] = useState("A+");

    const [isLoading, setIsLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await fetch("/api/patients");
            const data = await res.json();
            if (!data.error) {
                setPatients(data);
                if (data.length > 0 && !selectedPatient) {
                    setSelectedPatient(data[0]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch patients", err);
        }
    };

    const handleAddPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const payload = { name, dob, gender, contact, address, bloodGroup };

        try {
            const res = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const newPatient = await res.json();
            if (!newPatient.error) {
                setPatients([newPatient, ...patients]);
                setSelectedPatient(newPatient);
                setName(""); setDob(""); setContact(""); setAddress("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (patient: Patient) => {
        setEditId(patient.id);
        setEditName(patient.name);
        // Format date string safely to match YYYY-MM-DD input field rules
        setEditDob(patient.dob.split("T")[0]);
        setEditGender(patient.gender);
        setEditContact(patient.contact);
        setEditAddress(patient.address);
        setEditBloodGroup(patient.bloodGroup);
        setIsEditModalOpen(true);
    };

    const handleUpdatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editId) return;

        const payload = { id: editId, name: editName, dob: editDob, gender: editGender, contact: editContact, address: editAddress, bloodGroup: editBloodGroup };

        try {
            const res = await fetch("/api/patients", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const updated = await res.json();
            if (!updated.error) {
                const freshList = patients.map((p) => (p.id === editId ? updated : p));
                setPatients(freshList);
                setSelectedPatient(updated);
                setIsEditModalOpen(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeletePatient = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this patient record?")) return;

        try {
            const res = await fetch(`/api/patients?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                const updatedList = patients.filter((p) => p.id !== id);
                setPatients(updatedList);
                if (selectedPatient?.id === id) {
                    setSelectedPatient(updatedList.length > 0 ? updatedList[0] : null);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => router.push("/"), 400);
    };

    const filteredPatients = patients.filter((p) => {
        const matchString = `${p.name.toLowerCase()} ${p.id}`;
        return matchString.includes(searchQuery.toLowerCase().trim());
    });

    return (
        <div className="min-h-screen w-full bg-[#f3f4f6] text-slate-900 flex flex-col font-sans">

            {/* Top Professional Navigation Banner */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
                <div className="flex items-center gap-2">
                    <Activity className="text-[#635bff]" size={24} />
                    <span className="text-xl font-bold tracking-tight">Medi Core</span>
                    <span className="ml-2 bg-[#635bff]/10 text-[#635bff] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        Patient Hub
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-slate-400 hidden sm:inline">Terminal Operational</span>
                    <div className="h-4 w-px bg-slate-200 hidden sm:inline" />
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-100 px-3 py-1.5 text-xs font-semibold transition text-slate-600 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        <LogOut size={14} className={isLoggingOut ? "animate-pulse" : ""} />
                        {isLoggingOut ? "Ending Session..." : "Log Out"}
                    </button>
                </div>
            </header>

            {/* Main Content Workspace */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden max-w-7xl w-full mx-auto">

                {/* LEFT COLUMN: Registration Input Box */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-fit">
                    <div className="flex items-center gap-2 mb-4">
                        <UserPlus className="text-[#635bff]" size={20} />
                        <h2 className="text-lg font-bold text-slate-800">Registration Intake</h2>
                    </div>

                    <form onSubmit={handleAddPatient} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                                <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Number</label>
                                <input type="tel" required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Group</label>
                                <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10">
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Residential Address</label>
                            <textarea required rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10 resize-none" />
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[#635bff] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#635bff]/10 transition hover:bg-[#5249e0] mt-2 cursor-pointer">
                            {isLoading ? "Saving Record..." : "Add Patient Record"}
                        </button>
                    </form>
                </div>

                {/* RIGHT COLUMN: Directory Listing & History Visualizers */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Active Live Directory Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col flex-1 max-h-[380px] overflow-hidden">
                        <div className="flex items-center justify-between mb-3 gap-4">
                            <h3 className="text-base font-bold text-slate-800 shrink-0">Patient Directory</h3>
                            <div className="relative w-full max-w-xs">
                                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by Name or system ID..." className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs outline-none transition focus:border-[#635bff] focus:bg-white" />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 border border-slate-100 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-100">
                                    <tr>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Patient Name</th>
                                        <th className="p-3">Gender</th>
                                        <th className="p-3">Contact</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredPatients.map((p) => (
                                        <tr key={p.id} onClick={() => setSelectedPatient(p)} className={`cursor-pointer transition ${selectedPatient?.id === p.id ? "bg-[#635bff]/5 font-medium border-l-2 border-l-[#635bff]" : "hover:bg-slate-50"}`}>
                                            <td className="p-3 text-slate-400 font-mono">#{p.id}</td>
                                            <td className="p-3 text-slate-900 font-medium">{p.name}</td>
                                            <td className="p-3 text-slate-500">{p.gender}</td>
                                            <td className="p-3 text-slate-500">{p.contact}</td>
                                            <td className="p-3 text-center flex items-center justify-center gap-2">
                                                <button onClick={(e) => handleDeletePatient(p.id, e)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* LOWER DETAILED VIEWER Panel */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-1">
                        {selectedPatient ? (
                            <div>
                                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                                    <div>
                                        <span className="text-xs font-mono font-bold text-[#635bff] bg-[#635bff]/10 px-2 py-0.5 rounded">PATIENT CASE RECORD #{selectedPatient.id}</span>
                                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{selectedPatient.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => openEditModal(selectedPatient)} className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer">
                                            <Edit3 size={13} /> Edit Profile
                                        </button>
                                        <div className="flex items-center gap-1 bg-red-50 border border-red-100 text-red-600 rounded-xl px-3 py-1 text-xs font-bold"><Droplet size={14} fill="currentColor" />Blood: {selectedPatient.bloodGroup}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                    <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100"><Calendar size={16} className="text-slate-400" /><div><div className="text-slate-400 font-medium text-[10px]">DATE OF BIRTH</div><div className="font-semibold text-slate-800">{selectedPatient.dob.split("T")[0]}</div></div></div>
                                    <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100"><Activity size={16} className="text-slate-400" /><div><div className="text-slate-400 font-medium text-[10px]">IDENTIFIED GENDER</div><div className="font-semibold text-slate-800">{selectedPatient.gender}</div></div></div>
                                    <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100"><Phone size={16} className="text-slate-400" /><div><div className="text-slate-400 font-medium text-[10px]">TELEPHONE LINE</div><div className="font-semibold text-slate-800">{selectedPatient.contact}</div></div></div>
                                </div>

                                <div className="mt-4 flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                    <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <div><div className="text-slate-400 font-medium text-[10px]">REGISTERED DOMICILE ADDRESS</div><div className="font-medium text-slate-800">{selectedPatient.address}</div></div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400"><ShieldAlert size={36} className="stroke-1 mb-2" /><p className="text-xs">Select a profile to load case charts.</p></div>
                        )}
                    </div>
                </div>
            </div>

            {/* EDIT PATIENT INLINE INTERACTIVE MODAL OVERLAY */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl max-w-md w-full relative">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"><X size={18} /></button>

                        <div className="flex items-center gap-2 mb-4">
                            <Edit3 className="text-[#635bff]" size={20} />
                            <h3 className="text-lg font-bold text-slate-800">Modify Patient Record #{editId}</h3>
                        </div>

                        <form onSubmit={handleUpdatePatient} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#635bff]" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                                    <input type="date" required value={editDob} onChange={(e) => setEditDob(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                                    <select value={editGender} onChange={(e) => setEditGender(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Number</label>
                                    <input type="text" required value={editContact} onChange={(e) => setEditContact(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Group</label>
                                    <select value={editBloodGroup} onChange={(e) => setEditBloodGroup(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Residential Address</label>
                                <textarea required rows={2} value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none resize-none" />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#635bff] hover:bg-[#5249e0] rounded-xl shadow-md shadow-[#635bff]/10 transition">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}