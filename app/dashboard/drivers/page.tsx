"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, X, Trash2, Users } from "lucide-react";

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore: number;
  status: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
}

const statusStyles: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  ON_TRIP: "bg-blue-100 text-blue-700",
  OFF_DUTY: "bg-slate-200 text-slate-600",
  SUSPENDED: "bg-red-100 text-red-700",
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    licenseNumber: "",
    licenseCategory: "LMV",
    licenseExpiryDate: "",
    contactNumber: "",
  });

  const loadDrivers = () => {
    setLoading(true);
    fetch("/api/drivers")
      .then((res) => res.json())
      .then((data) => setDrivers(data.drivers || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const isExpired = (date: string) => new Date(date) < new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add driver");
        setSubmitting(false);
        return;
      }

      toast.success("Driver added successfully!");
      setShowModal(false);
      setForm({ name: "", licenseNumber: "", licenseCategory: "LMV", licenseExpiryDate: "", contactNumber: "" });
      loadDrivers();
    } catch {
      toast.error("Something went wrong");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this driver?")) return;
    const res = await fetch(`/api/drivers/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Delete failed");
      return;
    }
    toast.success("Driver deleted");
    loadDrivers();
  };

  const handleSuspend = async (id: string, current: string) => {
    const newStatus = current === "SUSPENDED" ? "AVAILABLE" : "SUSPENDED";
    const res = await fetch(`/api/drivers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(newStatus === "SUSPENDED" ? "Driver suspended" : "Driver reinstated");
      loadDrivers();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Driver Management</h2>
          <p className="text-slate-500 mt-1">Manage driver profiles and compliance</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition"
        >
          <Plus size={18} /> Add Driver
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-400">Loading...</p>
        ) : drivers.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">No drivers yet. Add your first driver to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">License No.</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Expiry</th>
                <th className="px-6 py-3 font-medium">Safety Score</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{d.name}</td>
                  <td className="px-6 py-4">{d.licenseNumber}</td>
                  <td className="px-6 py-4">{d.licenseCategory}</td>
                  <td className={`px-6 py-4 ${isExpired(d.licenseExpiryDate) ? "text-red-600 font-medium" : ""}`}>
                    {new Date(d.licenseExpiryDate).toLocaleDateString()}
                    {isExpired(d.licenseExpiryDate) && " (Expired)"}
                  </td>
                  <td className="px-6 py-4">{(d.safetyScore ?? 0).toFixed(1)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[d.status]}`}>
                      {d.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => handleSuspend(d.id, d.status)}
                      className="text-slate-500 hover:text-orange-600 text-xs font-medium"
                    >
                      {d.status === "SUSPENDED" ? "Reinstate" : "Suspend"}
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
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
              <h3 className="text-xl font-bold text-slate-800">Add Driver</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={22} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="Alex Kumar"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">License Number</label>
                <input
                  required
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">License Category</label>
                  <select
                    value={form.licenseCategory}
                    onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  >
                    <option value="LMV">LMV</option>
                    <option value="HMV">HMV</option>
                    <option value="Transport">Transport</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">License Expiry</label>
                  <input
                    required
                    type="date"
                    value={form.licenseExpiryDate}
                    onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Contact Number</label>
                <input
                  required
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="+91 9876543210"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Driver"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
