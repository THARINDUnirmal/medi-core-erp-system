"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Droplets,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

type Patient = {
  id: number;
  name: string;
  dob: string;
  gender: string;
  contact: string;
  address: string;
  bloodGroup: string;
  createdAt?: string;
};

type FormState = Omit<Patient, "id" | "createdAt">;

const emptyForm: FormState = {
  name: "",
  dob: "",
  gender: "Male",
  contact: "",
  address: "",
  bloodGroup: "A+",
};

export default function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/patients", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Failed to load patients.");
      setPatients(data);
      setSelectedId((current) => current ?? data[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const selected = patients.find((patient) => patient.id === selectedId) ?? null;
  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return patients;
    return patients.filter((patient) =>
      [patient.id, patient.name, patient.gender, patient.contact, patient.address, patient.bloodGroup]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [patients, query]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function editPatient(patient: Patient) {
    setEditingId(patient.id);
    setSelectedId(patient.id);
    setForm({
      name: patient.name,
      dob: patient.dob.slice(0, 10),
      gender: patient.gender,
      contact: patient.contact,
      address: patient.address,
      bloodGroup: patient.bloodGroup,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitPatient(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/patients", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Request failed.");
      setMessage(editingId ? "Patient profile updated successfully." : "Patient record added successfully.");
      setSelectedId(data.id);
      resetForm();
      await loadPatients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePatient(patient: Patient) {
    if (!window.confirm(`Delete ${patient.name}'s patient record?`)) return;
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/patients?id=${patient.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Delete failed.");
      setPatients((current) => current.filter((item) => item.id !== patient.id));
      if (selectedId === patient.id) setSelectedId(null);
      if (editingId === patient.id) resetForm();
      setMessage("Patient deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9] text-slate-900">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm md:px-8">
        <div className="flex items-center gap-3">
          <Activity className="h-7 w-7 text-violet-600" />
          <span className="text-xl font-extrabold tracking-tight">Medi Core</span>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">Patient Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-400 sm:block">Terminal Operational</span>
          <button onClick={() => (window.location.href = "/")} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1500px] gap-6 p-4 md:p-7 xl:grid-cols-[420px_1fr]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-6">
          <div className="mb-6 flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-violet-600" />
            <h1 className="text-2xl font-bold">{editingId ? "Edit Patient" : "Registration Intake"}</h1>
          </div>

          <form onSubmit={submitPatient} className="space-y-5">
            <Field label="Full Name">
              <input required value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="John Doe" className="input" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date of Birth">
                <input required type="date" value={form.dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => updateField("dob", e.target.value)} className="input" />
              </Field>
              <Field label="Gender">
                <select value={form.gender} onChange={(e) => updateField("gender", e.target.value)} className="input">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact Number">
                <input required value={form.contact} onChange={(e) => updateField("contact", e.target.value)} placeholder="070 123 4567" className="input" />
              </Field>
              <Field label="Blood Group">
                <select value={form.bloodGroup} onChange={(e) => updateField("bloodGroup", e.target.value)} className="input">
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((group) => <option key={group}>{group}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Residential Address">
              <textarea required value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Street address..." className="input min-h-24 resize-none" />
            </Field>

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
            {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{message}</p>}

            <button disabled={saving} className="w-full rounded-xl bg-violet-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:opacity-60">
              {saving ? "Saving..." : editingId ? "Update Patient Record" : "Add Patient Record"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50">
                <X className="h-4 w-4" /> Cancel Editing
              </button>
            )}
          </form>
        </aside>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-bold">Patient Directory</h2>
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 md:w-80">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or system ID..." className="w-full bg-transparent text-sm outline-none" />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-5 py-4">ID</th><th className="px-5 py-4">Patient Name</th><th className="px-5 py-4">Gender</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4 text-center">Action</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">Loading patient records...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No patient records found.</td></tr>
                  ) : filtered.map((patient) => (
                    <tr key={patient.id} onClick={() => setSelectedId(patient.id)} className={`cursor-pointer border-t border-slate-100 transition hover:bg-violet-50/60 ${selectedId === patient.id ? "bg-violet-50" : ""}`}>
                      <td className={`border-l-2 px-5 py-5 font-medium ${selectedId === patient.id ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500"}`}>#{patient.id}</td>
                      <td className="px-5 py-5 font-semibold">{patient.name}</td>
                      <td className="px-5 py-5 text-slate-600">{patient.gender}</td>
                      <td className="px-5 py-5 text-slate-600">{patient.contact}</td>
                      <td className="px-5 py-5">
                        <div className="flex justify-center gap-2">
                          <button aria-label="Edit patient" onClick={(e) => { e.stopPropagation(); editPatient(patient); }} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-violet-600"><Pencil className="h-4 w-4" /></button>
                          <button aria-label="Delete patient" onClick={(e) => { e.stopPropagation(); deletePatient(patient); }} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="min-h-80 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {selected ? (
              <>
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="rounded bg-violet-100 px-2 py-1 text-xs font-bold tracking-wide text-violet-700">PATIENT CASE RECORD #{selected.id}</span>
                    <h2 className="mt-3 text-3xl font-extrabold">{selected.name}</h2>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => editPatient(selected)} className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"><Pencil className="h-4 w-4" /> Edit Profile</button>
                    <span className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600"><Droplets className="h-4 w-4" /> Blood: {selected.bloodGroup}</span>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <InfoCard icon={<CalendarDays />} label="Date of Birth" value={formatDate(selected.dob)} />
                  <InfoCard icon={<Activity />} label="Identified Gender" value={selected.gender} />
                  <InfoCard icon={<Phone />} label="Telephone Line" value={selected.contact} />
                  <div className="md:col-span-3"><InfoCard icon={<MapPin />} label="Registered Domicile Address" value={selected.address} /></div>
                </div>
              </>
            ) : (
              <div className="flex min-h-64 items-center justify-center text-center text-slate-400">Select a patient from the directory to view the case record.</div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-600">{label}</span>{children}</label>;
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
      <span className="text-slate-400 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-700">{value}</p></div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-CA");
}
