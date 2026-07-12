"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, X, MapPin, CheckCircle2, XCircle } from "lucide-react";

interface Vehicle { id: string; registrationNumber: string; name: string; status: string; capacity: number; }
interface Driver { id: string; name: string; status: string; }
interface Trip {
  id: string;
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  status: string;
  vehicle: Vehicle | null;
  driver: Driver | null;
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-slate-200 text-slate-600",
  DISPATCHED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ source: "", destination: "", vehicleId: "", driverId: "", cargoWeight: "", plannedDistance: "" });

  const loadAll = () => {
    fetch("/api/vehicles").then((r) => r.json()).then((d) => setVehicles((d.vehicles || []).filter((v: any) => v.status === "AVAILABLE")));
    fetch("/api/drivers").then((r) => r.json()).then((d) => setDrivers((d.drivers || []).filter((dr: any) => dr.status === "AVAILABLE")));
    fetch("/api/trips").then((r) => r.json()).then((d) => setTrips(d.trips || []));
  };

  useEffect(() => { loadAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to create trip"); setSubmitting(false); return; }
    toast.success("Trip created and dispatched!");
    setShowModal(false);
    setForm({ source: "", destination: "", vehicleId: "", driverId: "", cargoWeight: "", plannedDistance: "" });
    loadAll();
    setSubmitting(false);
  };

  const handleAction = async (id: string, action: "complete" | "cancel") => {
    const res = await fetch(`/api/trips/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Action failed"); return; }
    toast.success(action === "complete" ? "Trip completed!" : "Trip cancelled");
    loadAll();
  };

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm";

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Trip Management</h2>
          <p className="text-slate-500 mt-1">Dispatch and track fleet trips</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition">
          <Plus size={18} /> New Trip
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {trips.length === 0 ? (
          <div className="p-16 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">No trips yet. Create your first trip.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Route</th>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Driver</th>
                <th className="px-6 py-3 font-medium">Cargo</th>
                <th className="px-6 py-3 font-medium">Distance</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{t.source} → {t.destination}</td>
                  <td className="px-6 py-4">{t.vehicle?.registrationNumber}</td>
                  <td className="px-6 py-4">{t.driver?.name}</td>
                  <td className="px-6 py-4">{t.cargoWeight} kg</td>
                  <td className="px-6 py-4">{t.plannedDistance} km</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[t.status]}`}>{t.status}</span></td>
                  <td className="px-6 py-4 flex gap-3">
                    {t.status === "DISPATCHED" && (
                      <>
                        <button onClick={() => handleAction(t.id, "complete")} className="text-emerald-600 hover:text-emerald-800" title="Complete"><CheckCircle2 size={18} /></button>
                        <button onClick={() => handleAction(t.id, "cancel")} className="text-red-500 hover:text-red-700" title="Cancel"><XCircle size={18} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Create New Trip</h3>
              <button onClick={() => setShowModal(false)}><X size={22} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputClass} />
                <input required placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputClass} />
              </div>
              <select required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className={inputClass}>
                <option value="">Select Available Vehicle</option>
                {vehicles.map((v) => (<option key={v.id} value={v.id}>{v.registrationNumber} - {v.name} (max {v.capacity}kg)</option>))}
              </select>
              <select required value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className={inputClass}>
                <option value="">Select Available Driver</option>
                {drivers.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Cargo Weight (kg)" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} className={inputClass} />
                <input required type="number" placeholder="Planned Distance (km)" value={form.plannedDistance} onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })} className={inputClass} />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50">{submitting ? "Dispatching..." : "Create & Dispatch Trip"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
