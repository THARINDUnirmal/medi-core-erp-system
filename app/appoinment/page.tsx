"use client";

/**
 * page.tsx — Appointment Staff Terminal View (Process 2)
 * ------------------------------------------------------
 * Appointment Scheduling desk for Medi Core ERP.
 *
 * Features
 *   • Book appointment  → Schedule Slot Registration panel (POST)
 *   • Assign doctor     → practitioner selector + shift monitor
 *   • View appointment  → Live Booking Queue + Scheduling Dossier (GET)
 *   • Change schedule / status / doctor (PUT) and remove slots (DELETE)
 */

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  AlertTriangle,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type Appointment = {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM:SS
  status: string;
  createdAt: string;
};

const DOCTORS = [
  {
    id: 101,
    name: "Dr. Alex Garcia",
    specialty: "Cardiology",
    shift: "08:00 AM - 12:00 PM",
  },
  {
    id: 102,
    name: "Dr. Sarah Jenkins",
    specialty: "Pediatrics",
    shift: "01:00 PM - 05:00 PM",
  },
  {
    id: 103,
    name: "Dr. Michael Chang",
    specialty: "Neurology",
    shift: "09:00 AM - 03:00 PM",
  },
];

const STATUSES = ["Scheduled", "Completed", "Cancelled"] as const;

const STATUS_BADGE: Record<string, string> = {
  Scheduled: "bg-amber-50 text-amber-600",
  Completed: "bg-emerald-50 text-emerald-600",
  Cancelled: "bg-red-50 text-red-500",
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const hhmm = (t: string) => (t ? t.slice(0, 5) : "");

function doctorLabel(doctorId: number) {
  const doc = DOCTORS.find((d) => d.id === doctorId);
  return doc ? `${doc.name} (${doc.specialty})` : `Physician Employee #${doctorId}`;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function AppointmentTerminal() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Booking form state
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState(String(DOCTORS[0].id));
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [initialStatus, setInitialStatus] = useState<string>("Scheduled");
  const [booking, setBooking] = useState(false);

  // Edit (change schedule / status) state
  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editStatus, setEditStatus] = useState<string>("Scheduled");
  const [editDoctor, setEditDoctor] = useState(String(DOCTORS[0].id));
  const [saving, setSaving] = useState(false);

  const selected = appointments.find((a) => a.id === selectedId) ?? null;

  const flash = (kind: "ok" | "err", text: string) => {
    setBanner({ kind, text });
    window.setTimeout(() => setBanner(null), 4500);
  };

  /* ---------------------------- data io ---------------------------- */

  const loadAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const rows: Appointment[] = json.data;
      setAppointments(rows);
      setSelectedId((prev) =>
        prev && rows.some((r) => r.id === prev) ? prev : (rows[0]?.id ?? null),
      );
    } catch (err) {
      flash(
        "err",
        err instanceof Error
          ? err.message
          : "Could not reach the appointments API.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function bookSlot(e: React.FormEvent) {
    e.preventDefault();
    setBooking(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: Number(patientId),
          doctorId: Number(doctorId),
          appointmentDate: date,
          appointmentTime: time,
          status: initialStatus,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      flash("ok", `Appointment #${json.data.id} booked successfully.`);
      setPatientId("");
      setDate("");
      setTime("");
      setInitialStatus("Scheduled");
      await loadAppointments();
      setSelectedId(json.data.id);
    } catch (err) {
      flash("err", err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setBooking(false);
    }
  }

  async function removeSlot(id: number) {
    try {
      const res = await fetch(`/api/appointments?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      flash("ok", `Appointment #${id} removed from the queue.`);
      await loadAppointments();
    } catch (err) {
      flash("err", err instanceof Error ? err.message : "Delete failed.");
    }
  }

  function openEditor() {
    if (!selected) return;
    setEditDate(selected.appointmentDate);
    setEditTime(hhmm(selected.appointmentTime));
    setEditStatus(selected.status);
    setEditDoctor(String(selected.doctorId));
    setEditing(true);
  }

  async function saveChanges(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          appointmentDate: editDate,
          appointmentTime: editTime,
          status: editStatus,
          doctorId: Number(editDoctor),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      flash("ok", `Appointment #${selected.id} updated.`);
      setEditing(false);
      await loadAppointments();
    } catch (err) {
      flash("err", err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  /* ----------------------------- render ---------------------------- */

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar deskLabel="Appointment Desk" />

      {banner && (
        <div
          className={`mx-auto mt-4 flex max-w-[1500px] items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            banner.kind === "ok"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {banner.kind === "ok" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          {banner.text}
        </div>
      )}

      <main className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[1fr_400px]">
        {/* ============================ LEFT ============================ */}
        <div className="flex flex-col gap-6">
          {/* Live Booking Queue */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Live Booking Queue</h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Appt ID</th>
                    <th className="px-4 py-3">Patient ID</th>
                    <th className="px-4 py-3">Doctor ID</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted">
                        Loading booking queue…
                      </td>
                    </tr>
                  )}
                  {!loading && appointments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted">
                        No appointments in the queue yet — register the first
                        slot on the right.
                      </td>
                    </tr>
                  )}
                  {appointments.map((a) => {
                    const isSelected = a.id === selectedId;
                    return (
                      <tr
                        key={a.id}
                        onClick={() => {
                          setSelectedId(a.id);
                          setEditing(false);
                        }}
                        className={`cursor-pointer border-b border-gray-50 transition-colors ${
                          isSelected
                            ? "border-l-4 border-l-primary bg-primary-faint"
                            : "border-l-4 border-l-transparent hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-4 font-mono text-xs text-muted">
                          #{a.id}
                        </td>
                        <td className="px-4 py-4 font-semibold text-ink">
                          Patient #{a.patientId}
                        </td>
                        <td className="px-4 py-4 text-ink">Doc #{a.doctorId}</td>
                        <td className="px-4 py-4 text-muted">
                          {a.appointmentDate} at {hhmm(a.appointmentTime)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                              STATUS_BADGE[a.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            aria-label={`Delete appointment ${a.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSlot(a.id);
                            }}
                            className="rounded-md p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Scheduling Dossier */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            {selected ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-md bg-primary-soft px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-primary">
                    Scheduling Dossier #{selected.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => (editing ? setEditing(false) : openEditor())}
                    className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-canvas"
                  >
                    {editing ? (
                      <>
                        <X className="h-4 w-4" /> Close Editor
                      </>
                    ) : (
                      <>
                        <Pencil className="h-4 w-4" /> Change Schedule / Status
                      </>
                    )}
                  </button>
                </div>

                <h2 className="mt-3 text-2xl font-bold text-ink">
                  Confirmed Operational Booking
                </h2>

                {!editing && (
                  <>
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-4">
                        <User className="h-5 w-5 shrink-0 text-muted" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                            Patient ID System Card
                          </p>
                          <p className="mt-0.5 font-semibold text-ink">
                            #{selected.patientId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-4">
                        <CalendarDays className="h-5 w-5 shrink-0 text-muted" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                            Target Clinic Date
                          </p>
                          <p className="mt-0.5 font-semibold text-ink">
                            {selected.appointmentDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-4">
                        <Clock className="h-5 w-5 shrink-0 text-muted" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                            Reserved Timeframe
                          </p>
                          <p className="mt-0.5 font-semibold text-ink">
                            {selected.appointmentTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-4 text-sm">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                      <p className="text-muted">
                        Assigned Practitioner Code Block:{" "}
                        <span className="font-bold text-ink">
                          {doctorLabel(selected.doctorId)} — Physician Employee #
                          {selected.doctorId}
                        </span>
                      </p>
                    </div>
                  </>
                )}

                {editing && (
                  <form
                    onSubmit={saveChanges}
                    className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    <label className="block">
                      <span className="text-sm font-semibold text-ink">
                        Appointment Date
                      </span>
                      <input
                        type="date"
                        required
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-ink">
                        Appointment Time
                      </span>
                      <input
                        type="time"
                        required
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-ink">
                        Assigned Practitioner
                      </span>
                      <select
                        value={editDoctor}
                        onChange={(e) => setEditDoctor(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {DOCTORS.map((d) => (
                          <option key={d.id} value={d.id}>
                            #{d.id} — {d.name} ({d.specialty})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-ink">Status</span>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex gap-3 sm:col-span-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-strong disabled:opacity-60"
                      >
                        {saving ? "Saving…" : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-canvas"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="py-10 text-center text-muted">
                Select an appointment in the queue to open its scheduling
                dossier.
              </div>
            )}
          </section>
        </div>

        {/* ============================ RIGHT =========================== */}
        <div className="flex flex-col gap-6">
          {/* Schedule Slot Registration */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-ink">
                Schedule Slot Registration
              </h2>
            </div>

            <form onSubmit={bookSlot} className="mt-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold text-ink">
                    Patient ID
                  </span>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="e.g. 1"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-ink">
                    Doctor ID
                  </span>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {DOCTORS.map((d) => (
                      <option key={d.id} value={d.id}>
                        #{d.id} — {d.name.replace("Dr. ", "")}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Appointment Date
                </span>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Appointment Time
                </span>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">
                  Initial Status
                </span>
                <select
                  value={initialStatus}
                  onChange={(e) => setInitialStatus(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={booking}
                className="mt-1 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-strong disabled:opacity-60"
              >
                {booking ? "Booking…" : "Book Appointment Slot"}
              </button>
            </form>
          </section>

          {/* Practitioner Shift Monitor */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink">
                Practitioner Shift Monitor
              </h2>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {DOCTORS.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-gray-50/80 px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-xs font-bold text-primary">
                      ID: #{d.id}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-ink">
                      {d.name}{" "}
                      <span className="font-normal text-muted">
                        ({d.specialty})
                      </span>
                    </p>
                  </div>
                  <span className="whitespace-nowrap rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600">
                    {d.shift}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
