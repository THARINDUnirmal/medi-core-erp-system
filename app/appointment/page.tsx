"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, Calendar, Clock, User, ShieldAlert, Trash2, Edit3, LogOut, CheckCircle, AlertTriangle, X } from "lucide-react";

interface Appointment {
    id: number;
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
}

export default function AppointmentManagement() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Booking Form State
    const [patientId, setPatientId] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [status, setStatus] = useState("Scheduled");

    // Edit Modal State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editPatientId, setEditPatientId] = useState("");
    const [editDoctorId, setEditDoctorId] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [editStatus, setEditStatus] = useState("Scheduled");

    const [isLoading, setIsLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Mock Doctor Availability Data for Reference Desk
    const doctorsList = [
        { id: 101, name: "Dr. Alex Garcia (Cardiology)", available: "08:00 AM - 12:00 PM" },
        { id: 102, name: "Dr. Sarah Jenkins (Pediatrics)", available: "01:00 PM - 05:00 PM" },
        { id: 103, name: "Dr. Michael Chang (Neurology)", available: "09:00 AM - 03:00 PM" },
    ];

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await fetch("/api/appointments");
            const data = await res.json();
            if (!data.error) {
                setAppointments(data);
                if (data.length > 0 && !selectedAppointment) {
                    setSelectedAppointment(data[0]);
                }
            }
        } catch (err) {
            console.error("Failed fetching appointments", err);
        }
    };

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const payload = { patientId: Number(patientId), doctorId: Number(doctorId), appointmentDate, appointmentTime, status };

        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const newAppt = await res.json();
            if (!newAppt.error) {
                setAppointments([newAppt, ...appointments]);
                setSelectedAppointment(newAppt);
                setPatientId(""); setDoctorId(""); setAppointmentDate(""); setAppointmentTime("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (appt: Appointment) => {
        setEditId(appt.id);
        setEditPatientId(appt.patientId.toString());
        setEditDoctorId(appt.doctorId.toString());
        setEditDate(appt.appointmentDate.split("T")[0]);
        setEditTime(appt.appointmentTime);
        setEditStatus(appt.status);
        setIsEditOpen(true);
    };

    const handleUpdateAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editId) return;

        const payload = { id: editId, patientId: Number(editPatientId), doctorId: Number(editDoctorId), appointmentDate: editDate, appointmentTime: editTime, status: editStatus };

        try {
            const res = await fetch("/api/appointments", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const updated = await res.json();
            if (!updated.error) {
                const freshList = appointments.map((a) => (a.id === editId ? updated : a));
                setAppointments(freshList);
                setSelectedAppointment(updated);
                setIsEditOpen(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteAppointment = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to cancel and delete this booked appointment row?")) return;

        try {
            const res = await fetch(`/api/appointments?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                const updatedList = appointments.filter((a) => a.id !== id);
                setAppointments(updatedList);
                if (selectedAppointment?.id === id) {
                    setSelectedAppointment(updatedList.length > 0 ? updatedList[0] : null);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusBadge = (statusStr: string) => {
        switch (statusStr) {
            case "Completed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Cancelled": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-amber-50 text-amber-600 border-amber-100";
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f3f4f6] text-slate-900 flex flex-col font-sans">

            {/* Navigation Banner */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
                <div className="flex items-center gap-2">
                    <Activity className="text-[#635bff]" size={24} />
                    <span className="text-xl font-bold tracking-tight">Medi Core</span>
                    <span className="ml-2 bg-[#635bff]/10 text-[#635bff] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        Appointment Desk
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

                {/* LEFT COMPONENT: Appointments Live Log Queue (8 Columns) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col flex-1 max-h-[380px] overflow-hidden">
                        <h3 className="text-base font-bold text-slate-800 mb-3">Live Booking Queue</h3>

                        <div className="overflow-y-auto flex-1 border border-slate-100 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-100">
                                    <tr>
                                        <th className="p-3">Appt ID</th>
                                        <th className="p-3">Patient ID</th>
                                        <th className="p-3">Doctor ID</th>
                                        <th className="p-3">Schedule</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {appointments.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-8 text-slate-400">No appointments scheduled for today.</td></tr>
                                    ) : (
                                        appointments.map((appt) => (
                                            <tr key={appt.id} onClick={() => setSelectedAppointment(appt)} className={`cursor-pointer transition ${selectedAppointment?.id === appt.id ? "bg-[#635bff]/5 font-medium border-l-2 border-l-[#635bff]" : "hover:bg-slate-50"}`}>
                                                <td className="p-3 text-slate-400 font-mono">#{appt.id}</td>
                                                <td className="p-3 font-medium text-slate-900">Patient #{appt.patientId}</td>
                                                <td className="p-3 text-slate-600">Doc #{appt.doctorId}</td>
                                                <td className="p-3 text-slate-500">{appt.appointmentDate.split("T")[0]} at {appt.appointmentTime.slice(0, 5)}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(appt.status)}`}>{appt.status}</span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button onClick={(e) => handleDeleteAppointment(appt.id, e)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"><Trash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* LOWER COMPONENT: Inspected Appointment Comprehensive Telemetry Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex-1">
                        {selectedAppointment ? (
                            <div>
                                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                                    <div>
                                        <span className="text-xs font-mono font-bold text-[#635bff] bg-[#635bff]/10 px-2 py-0.5 rounded">SCHEDULING DOSSIER #{selectedAppointment.id}</span>
                                        <h3 className="text-xl font-bold text-slate-900 mt-1">Confirmed Operational Booking</h3>
                                    </div>
                                    <button onClick={() => openEditModal(selectedAppointment)} className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer">
                                        <Edit3 size={13} /> Change Schedule / Status
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                    <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100"><User size={16} className="text-slate-400" /><div><div className="text-slate-400 font-medium text-[10px]">PATIENT ID SYSTEM CARD</div><div className="font-semibold text-slate-800">#{selectedAppointment.patientId}</div></div></div>
                                    <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100"><Calendar size={16} className="text-slate-400" /><div><div className="text-slate-400 font-medium text-[10px]">TARGET CLINIC DATE</div><div className="font-semibold text-slate-800">{selectedAppointment.appointmentDate.split("T")[0]}</div></div></div>
                                    <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100"><Clock size={16} className="text-slate-400" /><div><div className="text-slate-400 font-medium text-[10px]">RESERVED TIMEFRAME</div><div className="font-semibold text-slate-800">{selectedAppointment.appointmentTime}</div></div></div>
                                </div>

                                <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex items-center gap-2">
                                    <CheckCircle size={15} className="text-emerald-500" />
                                    <span className="text-slate-600">Assigned Practitioner Code Block: <strong>Physician Employee #{selectedAppointment.doctorId}</strong></span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400"><ShieldAlert size={36} className="stroke-1 mb-2" /><p className="text-xs">Select an active row block from the database queue left side table to query operational records.</p></div>
                        )}
                    </div>
                </div>

                {/* RIGHT COMPONENT: Action Panel, Doctor Schedule Checklist & Input Booking Frame (4 Columns) */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Intake Booking Registry Form */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-fit">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="text-[#635bff]" size={20} />
                            <h2 className="text-base font-bold text-slate-800">Schedule Slot Registration</h2>
                        </div>

                        <form onSubmit={handleBookAppointment} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Patient ID</label>
                                    <input type="number" required placeholder="e.g. 1" value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#635bff]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor ID</label>
                                    <input type="number" required placeholder="e.g. 101" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#635bff]" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Appointment Date</label>
                                <input type="date" required value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#635bff]" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Appointment Time</label>
                                <input type="time" required value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#635bff]" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none">
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[#635bff] py-2.5 text-xs font-semibold text-white shadow-md shadow-[#635bff]/10 transition hover:bg-[#5249e0] cursor-pointer">
                                {isLoading ? "Writing to Database..." : "Book Appointment Slot"}
                            </button>
                        </form>
                    </div>

                    {/* Doctor Roster Duty Reference Monitor */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col h-fit">
                        <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <AlertTriangle size={14} className="text-amber-500" />
                            <span>Practitioner Shift Monitor</span>
                        </div>
                        <div className="space-y-2">
                            {doctorsList.map((doc) => (
                                <div key={doc.id} className="text-[11px] p-2 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center">
                                    <div>
                                        <span className="font-mono text-slate-400 font-bold block">ID: #{doc.id}</span>
                                        <span className="font-medium text-slate-700">{doc.name}</span>
                                    </div>
                                    <span className="text-[10px] bg-slate-200/60 px-2 py-0.5 rounded font-medium text-slate-600">{doc.available}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* INTERACTIVE RESCHEDULE / EDIT OVERLAY MODAL */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl max-w-sm w-full relative">
                        <button onClick={() => setIsEditOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"><X size={18} /></button>

                        <div className="flex items-center gap-2 mb-4">
                            <Edit3 className="text-[#635bff]" size={20} />
                            <h3 className="text-base font-bold text-slate-800">Reschedule Appointment #{editId}</h3>
                        </div>

                        <form onSubmit={handleUpdateAppointment} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-600 mb-1">Patient ID</label>
                                    <input type="number" required value={editPatientId} onChange={(e) => setEditPatientId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#635bff]" />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 mb-1">Doctor ID</label>
                                    <input type="number" required value={editDoctorId} onChange={(e) => setEditDoctorId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#635bff]" />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-600 mb-1">Change Date</label>
                                <input type="date" required value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none" />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-600 mb-1">Change Time</label>
                                <input type="time" required value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none" />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-600 mb-1">Update Status</label>
                                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none">
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition">Dismiss</button>
                                <button type="submit" className="px-4 py-2 font-semibold text-white bg-[#635bff] hover:bg-[#5249e0] rounded-xl transition shadow-md">Commit Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}