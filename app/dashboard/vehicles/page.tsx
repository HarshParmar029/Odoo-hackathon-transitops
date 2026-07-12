"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, X, Trash2, Truck } from "lucide-react";

interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number | null;
  status: "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
}

const statusStyles: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  ON_TRIP: "bg-blue-100 text-blue-700",
  IN_SHOP: "bg-orange-100 text-orange-700",
  RETIRED: "bg-slate-200 text-slate-600",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    registrationNumber: "",
    name: "",
    type: "Truck",
    maxLoadCapacity: "",
    odometer: "0",
    acquisitionCost: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadVehicles = () => {
    setLoading(true);
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add vehicle");
        setSubmitting(false);
        return;
      }

      toast.success("Vehicle added successfully!");
      setShowModal(false);
      setForm({ registrationNumber: "", name: "", type: "Truck", maxLoadCapacity: "", odometer: "0", acquisitionCost: "" });
      loadVehicles();
    } catch (err) {
      toast.error("Something went wrong");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Delete failed");
      return;
    }
    toast.success("Vehicle deleted");
    loadVehicles();
  };

  const handleRetire = async (id: string) => {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RETIRED" }),
    });
    if (res.ok) {
      toast.success("Vehicle retired");
      loadVehicles();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Vehicle Registry</h2>
          <p className="text-slate-500 mt-1">Manage your fleet's vehicles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition"
        >
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-400">Loading...</p>
        ) : vehicles.length === 0 ? (
          <div className="p-16 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">No vehicles yet. Add your first vehicle to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Registration No.</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Max Load (kg)</th>
                <th className="px-6 py-3 font-medium">Odometer</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{v.registrationNumber}</td>
                  <td className="px-6 py-4">{v.name}</td>
                  <td className="px-6 py-4">{v.type}</td>
                  <td className="px-6 py-4">{v.maxLoadCapacity} kg</td>
                  <td className="px-6 py-4">{v.odometer} km</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[v.status]}`}>
                      {v.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    {v.status !== "RETIRED" && (
                      <button onClick={() => handleRetire(v.id)} className="text-slate-500 hover:text-orange-600 text-xs font-medium">
                        Retire
                      </button>
                    )}
                    <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700">
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
              <h3 className="text-xl font-bold text-slate-800">Add Vehicle</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={22} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Registration Number</label>
                <input
                  required
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="Van-05"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Vehicle Name/Model</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="Tata Ace"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                >
                  <option>Truck</option>
                  <option>Van</option>
                  <option>Bus</option>
                  <option>Mini Truck</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Max Load (kg)</label>
                  <input
                    required
                    type="number"
                    value={form.maxLoadCapacity}
                    onChange={(e) => setForm({ ...form, maxLoadCapacity: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Odometer (km)</label>
                  <input
                    type="number"
                    value={form.odometer}
                    onChange={(e) => setForm({ ...form, odometer: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Acquisition Cost (₹)</label>
                <input
                  required
                  type="number"
                  value={form.acquisitionCost}
                  onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Vehicle"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: string;
  capacity: number;
  status: string;
  mileage: number;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({ plateNumber: "", model: "", type: "TRUCK", capacity: "", status: "AVAILABLE" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadVehicles = async () => {
    const res = await fetch("/api/vehicles");
    const data = await res.json();
    setVehicles(data.vehicles || []);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/vehicles/${editingId}` : "/api/vehicles";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, capacity: Number(form.capacity) }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to save vehicle");
    } else {
      toast.success(editingId ? "Vehicle updated" : "Vehicle created");
      setForm({ plateNumber: "", model: "", type: "TRUCK", capacity: "", status: "AVAILABLE" });
      setEditingId(null);
      loadVehicles();
    }
    setLoading(false);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setForm({
      plateNumber: vehicle.plateNumber,
      model: vehicle.model,
      type: vehicle.type,
      capacity: String(vehicle.capacity),
      status: vehicle.status,
    });
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to delete vehicle");
    } else {
      toast.success("Vehicle deleted");
      loadVehicles();
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Vehicle Registry</h2>
          <p className="text-slate-500">Track fleet availability, capacity, and health</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-800">
            <Plus size={18} />
            <h3 className="text-lg font-semibold">{editingId ? "Edit Vehicle" : "Add Vehicle"}</h3>
          </div>

          <div className="space-y-4">
            <input value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} placeholder="Plate Number" className="w-full rounded-xl border border-slate-200 px-3 py-2" required />
            <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Model" className="w-full rounded-xl border border-slate-200 px-3 py-2" required />
            <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Type" className="w-full rounded-xl border border-slate-200 px-3 py-2" required />
            <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Capacity" className="w-full rounded-xl border border-slate-200 px-3 py-2" required />
            <select title="Vehicle status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2">
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="IN_SHOP">In Shop</option>
            </select>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-900 py-2.5 font-medium text-white hover:bg-slate-800 disabled:opacity-50">
              {loading ? "Saving..." : editingId ? "Update Vehicle" : "Create Vehicle"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Fleet Vehicles</h3>
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                <div>
                  <p className="font-semibold text-slate-800">{vehicle.plateNumber}</p>
                  <p className="text-sm text-slate-500">{vehicle.model} • {vehicle.type} • {vehicle.capacity} pax</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${vehicle.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700" : vehicle.status === "ON_TRIP" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"}`}>
                    {vehicle.status.replace(/_/g, " ")}
                  </span>
                  <button title="Edit vehicle" onClick={() => handleEdit(vehicle)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                    <Pencil size={16} />
                  </button>
                  <button title="Delete vehicle" onClick={() => handleDelete(vehicle.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-100 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
