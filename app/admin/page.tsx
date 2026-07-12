"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Pill, 
  DollarSign, 
  Search, 
  Edit3, 
  Trash2, 
  LogOut, 
  PlusCircle
} from 'lucide-react';

// --- Type Definitions ---
type TabType = 'patients' | 'appointments' | 'pharmacy' | 'financial';

interface Patient { id: string; name: string; dob: string; gender: string; bloodGroup: string; contact: string; address: string; }
interface Appointment { id: string; patientId: string; doctorId: string; dateTime: string; status: 'Scheduled' | 'Completed' | 'Canceled'; }
interface PharmacyItem { id: string; name: string; quantity: number; unitPrice: number; expiryDate: string; }
interface FinancialRecord { id: string; patientId: string; billDate: string; amount: number; status: 'Paid' | 'Unpaid / Pending'; }
interface SystemMetrics { totalPatients: number; activeAppointments: number; settledCashFlowValuation: number; }

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic Live State Containers
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pharmacyInventory, setPharmacyInventory] = useState<PharmacyItem[]>([]);
  const [financials, setFinancials] = useState<FinancialRecord[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({ totalPatients: 0, activeAppointments: 0, settledCashFlowValuation: 0 });

  // Loading & Selection States
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('#1');

  // --- 1. Fetch System Core Master Repositories Data ---
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [resPatients, resAppts, resPharmacy, resFin, resMetrics] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/appointments'),
          fetch('/api/pharmacy'),
          fetch('/api/financial'),
          fetch('/api/admin')
        ]);

        if (resPatients.ok) setPatients(await resPatients.json());
        if (resAppts.ok) setAppointments(await resAppts.json());
        if (resPharmacy.ok) setPharmacyInventory(await resPharmacy.json());
        if (resFin.ok) setFinancials(await resFin.json());
        if (resMetrics.ok) {
          const systemData = await resMetrics.json();
          setMetrics({
            totalPatients: systemData.totalPatients,
            activeAppointments: systemData.activeAppointments,
            settledCashFlowValuation: systemData.settledCashFlowValuation
          });
        }
      } catch (error) {
        console.error("Critical error mapping runtime sync vectors:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // --- 2. Post Submission Handlers for Form Engines ---
  const handleCreateRecord = async (endpoint: string, payload: object, stateUpdater: Function) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const freshRecord = await response.json();
        stateUpdater((prev: any) => [...prev, freshRecord]);
        
        // Refresh global analytics summary counts
        const metricsRes = await fetch('/api/admin');
        if (metricsRes.ok) setMetrics(await metricsRes.json());
      }
    } catch (err) {
      console.error(`Execution fault generating context instance at /api/${endpoint}:`, err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-sans text-xs font-semibold tracking-widest uppercase">
        Syncing system databanks...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-1 bg-indigo-600 rounded-full" />
            <span className="text-xl font-black tracking-tight text-slate-950">Medi Core</span>
          </div>
          <span className="bg-red-50 text-[10px] font-bold text-red-600 tracking-wider uppercase px-2 py-0.5 rounded border border-red-200/60">
            Root Admin Control
          </span>
        </div>

        <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/40">
          {(['patients', 'appointments', 'pharmacy', 'financial'] as TabType[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {tab === 'patients' && <Users size={14} />}
              {tab === 'appointments' && <Calendar size={14} />}
              {tab === 'pharmacy' && <Pill size={14} />}
              {tab === 'financial' && <DollarSign size={14} />}
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </nav>

        <button className="flex items-center space-x-2 border border-slate-200 hover:bg-slate-50 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 shadow-sm">
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </header>

      <main className="max-w-[1600px] mx-auto p-8 space-y-8">
        
        {/* --- GLOBAL KPI METRICS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl"><Users size={22} /></div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Total Patients</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{metrics.totalPatients} Registered</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl"><Calendar size={22} /></div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Appointments Ledger</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{metrics.activeAppointments} Slotted</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={22} /></div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Cash Flow Settled</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">${metrics.settledCashFlowValuation.toFixed(2)}</h3>
            </div>
          </div>
        </section>

        {/* --- OPERATION CONSOLE SPACE --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-base font-bold text-slate-900 capitalize tracking-tight">{activeTab} Direct Master Rows</h2>
                <div className="relative max-w-xs w-full">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Search size={14} /></span>
                  <input 
                    type="text" 
                    placeholder="Filter records..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* DYNAMIC MASTER TABLES */}
              <div className="overflow-x-auto">
                {activeTab === 'patients' && (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase"><th className="py-3 px-6">ID</th><th className="py-3 px-6">Patient Name</th><th className="py-3 px-6">Blood Type</th><th className="py-3 px-6">Contact</th><th className="py-3 px-6">Address</th><th className="py-3 px-6 text-center">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {patients.map((p) => (
                        <tr key={p.id} onClick={() => setSelectedPatientId(p.id)} className={`hover:bg-slate-50/80 cursor-pointer ${selectedPatientId === p.id ? 'bg-indigo-50/30' : ''}`}>
                          <td className="py-3.5 px-6 font-mono text-slate-400">{p.id}</td>
                          <td className="py-3.5 px-6 font-bold text-slate-800">{p.name}</td>
                          <td className="py-3.5 px-6"><span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded text-[10px] border border-red-100">{p.bloodGroup}</span></td>
                          <td className="py-3.5 px-6 text-slate-600">{p.contact}</td>
                          <td className="py-3.5 px-6 text-slate-600">{p.address}</td>
                          <td className="py-3.5 px-6 text-center text-slate-400"><button className="hover:text-rose-600"><Trash2 size={14} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'appointments' && (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase"><th className="py-3 px-6">Appt ID</th><th className="py-3 px-6">Patient ID</th><th className="py-3 px-6">Doctor ID</th><th className="py-3 px-6">Date/Time</th><th className="py-3 px-6">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {appointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-6 font-mono text-slate-400">{appt.id}</td>
                          <td className="py-3.5 px-6 text-slate-700">{appt.patientId}</td>
                          <td className="py-3.5 px-6 text-slate-600 font-mono">{appt.doctorId}</td>
                          <td className="py-3.5 px-6 text-slate-500 font-mono">{appt.dateTime}</td>
                          <td className="py-3.5 px-6"><span className="bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded text-[10px] border border-amber-200/50">{appt.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'pharmacy' && (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase"><th className="py-3 px-6">Item ID</th><th className="py-3 px-6">Medicine Formulation</th><th className="py-3 px-6">Quantity</th><th className="py-3 px-6">Unit Price</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {pharmacyInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-6 font-mono text-slate-400">{item.id}</td>
                          <td className="py-3.5 px-6 font-bold text-slate-800">{item.name}</td>
                          <td className="py-3.5 px-6 text-slate-600">{item.quantity} units</td>
                          <td className="py-3.5 px-6 font-semibold text-slate-900">${item.unitPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'financial' && (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase"><th className="py-3 px-6">Bill ID</th><th className="py-3 px-6">Patient UID</th><th className="py-3 px-6">Bill Date</th><th className="py-3 px-6">Amount Due</th><th className="py-3 px-6">Standing</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {financials.map((bill) => (
                        <tr key={bill.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-6 font-mono text-slate-400">{bill.id}</td>
                          <td className="py-3.5 px-6 text-slate-700">{bill.patientId}</td>
                          <td className="py-3.5 px-6 text-slate-500 font-mono">{bill.billDate}</td>
                          <td className="py-3.5 px-6 font-bold text-slate-900">${bill.amount.toFixed(2)}</td>
                          <td className="py-3.5 px-6"><span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200/50">{bill.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* --- WORKSTATION REGISTRY SIDE PANEL --- */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
              <PlusCircle size={16} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 capitalize">{activeTab} Registry Workspace</h2>
            </div>

            {activeTab === 'patients' && (
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const target = e.currentTarget;
                const payload = {
                  name: (target.elements.namedItem('pName') as HTMLInputElement).value,
                  dob: (target.elements.namedItem('pDob') as HTMLInputElement).value,
                  gender: (target.elements.namedItem('pGender') as HTMLInputElement).value,
                  bloodGroup: (target.elements.namedItem('pBlood') as HTMLInputElement).value,
                  contact: (target.elements.namedItem('pContact') as HTMLInputElement).value,
                  address: (target.elements.namedItem('pAddress') as HTMLInputElement).value,
                };
                handleCreateRecord('patients', payload, setPatients);
                target.reset();
              }}>
                <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Patient Full Name</label><input name="pName" type="text" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" /></div>
                <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Date of Birth</label><input name="pDob" type="date" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Gender</label><input name="pGender" type="text" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg" /></div>
                  <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Blood Group</label><input name="pBlood" type="text" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold" /></div>
                </div>
                <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Contact Phone</label><input name="pContact" type="text" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" /></div>
                <div><label className="text-[11px] font-medium text-slate-500 block mb-1">City Address</label><input name="pAddress" type="text" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg" /></div>
                <button type="submit" className="w-full bg-slate-950 text-white text-[10px] font-bold tracking-wider uppercase py-2.5 rounded-lg hover:bg-slate-900 transition-colors">Commit Entry</button>
              </form>
            )}

            {activeTab === 'appointments' && (
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const target = e.currentTarget;
                const payload = {
                  patientId: `Patient #${(target.elements.namedItem('aPatId') as HTMLInputElement).value}`,
                  doctorId: `Doc #${(target.elements.namedItem('aDocId') as HTMLInputElement).value}`,
                  dateTime: `${(target.elements.namedItem('aDate') as HTMLInputElement).value} (${(target.elements.namedItem('aTime') as HTMLInputElement).value})`,
                  status: (target.elements.namedItem('aStatus') as HTMLSelectElement).value
                };
                handleCreateRecord('appointments', payload, setAppointments);
                target.reset();
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Patient ID</label><input name="aPatId" type="text" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" /></div>
                  <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Doctor ID</label><input name="aDocId" type="text" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" /></div>
                </div>
                <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Appointment Date</label><input name="aDate" type="date" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" /></div>
                <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Time Log</label><input name="aTime" type="text" placeholder="10:00:00" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" /></div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">Status Check</label>
                  <select name="aStatus" className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-slate-950 text-white text-[10px] font-bold tracking-wider uppercase py-2.5 rounded-lg hover:bg-slate-900 transition-colors">Commit Entry</button>
              </form>
            )}

            {activeTab === 'pharmacy' && (
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const target = e.currentTarget;
                const payload = {
                  name: (target.elements.namedItem('medName') as HTMLInputElement).value,
                  quantity: Number((target.elements.namedItem('medQty') as HTMLInputElement).value),
                  unitPrice: Number((target.elements.namedItem('medPrice') as HTMLInputElement).value),
                  expiryDate: (target.elements.namedItem('medExp') as HTMLInputElement).value
                };
                handleCreateRecord('pharmacy', payload, setPharmacyInventory);
                target.reset();
              }}>
                <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Formulation Name</label><input name="medName" type="text" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Stock Count</label><input name="medQty" type="number" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" /></div>
                  <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Unit Price ($)</label><input name="medPrice" type="text" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" /></div>
                </div>
                <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Expiry Date Target</label><input name="medExp" type="date" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" /></div>
                <button type="submit" className="w-full bg-slate-950 text-white text-[10px] font-bold tracking-wider uppercase py-2.5 rounded-lg hover:bg-slate-900 transition-colors">Commit Entry</button>
              </form>
            )}

            {activeTab === 'financial' && (
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const target = e.currentTarget;
                const payload = {
                  patientId: `Patient File #${(target.elements.namedItem('fPatId') as HTMLInputElement).value}`,
                  amount: Number((target.elements.namedItem('fAmount') as HTMLInputElement).value),
                  billDate: (target.elements.namedItem('fDate') as HTMLInputElement).value,
                  status: (target.elements.namedItem('fStatus') as HTMLSelectElement).value
                };
                handleCreateRecord('financial', payload, setFinancials);
                target.reset();
              }}>
                <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Patient reference ID</label><input name="fPatId" type="text" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" /></div>
                <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Valuation Amount ($)</label><input name="fAmount" type="text" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" /></div>
                <div><label className="text-[11px] font-medium text-slate-500 block mb-1">Statement Bill Date</label><input name="fDate" type="date" required className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono" /></div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">Settlement Status</label>
                  <select name="fStatus" className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                    <option value="Paid">Paid</option>
                    <option value="Unpaid / Pending">Unpaid / Pending</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-slate-950 text-white text-[10px] font-bold tracking-wider uppercase py-2.5 rounded-lg hover:bg-slate-900 transition-colors">Commit Entry</button>
              </form>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}