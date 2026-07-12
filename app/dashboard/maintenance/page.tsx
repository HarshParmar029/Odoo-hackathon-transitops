"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, X, Wrench } from "lucide-react";

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", title: "", description: "", cost: "" });

  const load = () => {
    fetch("/api/maintenance").then(r => r.json()).then(d => setLogs(d.maintenance || []));
    fetch("/api/vehicles").then(r => r.json()).then(d => setVehicles((d.vehicles || []).filter((v: any) => v.status !== "RETIRED")));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: form.vehicleId,
        title: form.title,
        description: form.description,
        cost: form.cost,
      }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to create record"); return; }
    toast.success("Maintenance record created, vehicle moved to In Shop");
    setShowModal(false);
    setForm({ vehicleId: "", title: "", description: "", cost: "" });
    load();
  };

  const handleClose = async (id: string) => {
    const res = await fetch(`/api/maintenance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed to close"); return; }
    toast.success("Maintenance closed, vehicle available again");
    load();
  };

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800";

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Maintenance</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium">
          <Plus size={18} /> New Record
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-16 text-center"><Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-400">No maintenance records yet.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr><th className="px-6 py-3">Vehicle</th><th className="px-6 py-3">Title</th><th className="px-6 py-3">Description</th><th className="px-6 py-3">Cost</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Action</th></tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">{l.vehicle?.registrationNumber || l.vehicle?.plateNumber}</td>
                  <td className="px-6 py-4">{l.title}</td>
                  <td className="px-6 py-4">{l.description}</td>
                  <td className="px-6 py-4">₹{l.cost}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${l.status === "PENDING" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>{l.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {l.status === "PENDING" && <button onClick={() => handleClose(l.id)} className="text-emerald-600 text-xs font-medium">Close</button>}
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
              <h3 className="text-xl font-bold">New Maintenance Record</h3>
              <button onClick={() => setShowModal(false)}><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className={inputClass}>
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber || v.plateNumber} - {v.name || v.model} ({v.status})</option>)}
              </select>
              <input required placeholder="Title (e.g. Oil Change)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
              <input required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
              <input required type="number" placeholder="Cost (₹)" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className={inputClass} />
              <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium">Create Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}