"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, X, Fuel } from "lucide-react";

export default function FuelPage() {
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [modal, setModal] = useState<"fuel" | "expense" | null>(null);
  const [fuelForm, setFuelForm] = useState({ vehicleId: "", amountLiters: "", cost: "" });
  const [expForm, setExpForm] = useState({ vehicleId: "", category: "Toll", amount: "", description: "" });

  const load = () => {
    fetch("/api/fuel").then(r => r.json()).then(d => setFuelLogs(d.fuelEntries || []));
    fetch("/api/expenses").then(r => r.json()).then(d => setExpenses(d.expenses || []));
    fetch("/api/vehicles").then(r => r.json()).then(d => setVehicles(d.vehicles || []));
  };
  useEffect(() => { load(); }, []);

  const submitFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/fuel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fuelForm),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed"); return; }
    toast.success("Fuel log added");
    setModal(null);
    setFuelForm({ vehicleId: "", amountLiters: "", cost: "" });
    load();
  };

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expForm),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error || "Failed"); return; }
    toast.success("Expense added");
    setModal(null);
    setExpForm({ vehicleId: "", category: "Toll", amount: "", description: "" });
    load();
  };

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800";

  const totalCostByVehicle: Record<string, number> = {};
  fuelLogs.forEach((f) => { totalCostByVehicle[f.vehicleId] = (totalCostByVehicle[f.vehicleId] || 0) + f.cost; });
  expenses.forEach((e) => { totalCostByVehicle[e.vehicleId] = (totalCostByVehicle[e.vehicleId] || 0) + e.amount; });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Fuel & Expenses</h2>
        <div className="flex gap-3">
          <button onClick={() => setModal("fuel")} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium"><Plus size={16} /> Fuel Log</button>
          <button onClick={() => setModal("expense")} className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2.5 rounded-xl font-medium"><Plus size={16} /> Expense</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Fuel size={18} /> Fuel Logs</h3>
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-left"><tr><th className="pb-2">Vehicle</th><th className="pb-2">Liters</th><th className="pb-2">Cost</th></tr></thead>
            <tbody>{fuelLogs.map((f) => (
              <tr key={f.id} className="border-t border-slate-100">
                <td className="py-2">{f.vehicle?.registrationNumber || f.vehicle?.plateNumber}</td>
                <td className="py-2">{f.amountLiters}L</td>
                <td className="py-2">₹{f.cost}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold mb-4">Other Expenses</h3>
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-left"><tr><th className="pb-2">Vehicle</th><th className="pb-2">Category</th><th className="pb-2">Amount</th></tr></thead>
            <tbody>{expenses.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="py-2">{e.vehicle?.registrationNumber || e.vehicle?.plateNumber}</td>
                <td className="py-2">{e.category}</td>
                <td className="py-2">₹{e.amount}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6">
        <h3 className="font-semibold mb-4">Total Operational Cost per Vehicle</h3>
        <table className="w-full text-sm">
          <thead className="text-slate-500 text-left"><tr><th className="pb-2">Vehicle</th><th className="pb-2">Total Cost</th></tr></thead>
          <tbody>{Object.entries(totalCostByVehicle).map(([vid, total]) => {
            const v = vehicles.find((veh) => veh.id === vid);
            return <tr key={vid} className="border-t border-slate-100"><td className="py-2">{v?.registrationNumber || v?.plateNumber || vid}</td><td className="py-2 font-medium">₹{total.toFixed(2)}</td></tr>;
          })}</tbody>
        </table>
      </div>

      {modal === "fuel" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Add Fuel Log</h3><button onClick={() => setModal(null)}><X size={22} /></button></div>
            <form onSubmit={submitFuel} className="space-y-4">
              <select required value={fuelForm.vehicleId} onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })} className={inputClass}>
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber || v.plateNumber}</option>)}
              </select>
              <input required type="number" placeholder="Liters" value={fuelForm.amountLiters} onChange={(e) => setFuelForm({ ...fuelForm, amountLiters: e.target.value })} className={inputClass} />
              <input required type="number" placeholder="Cost (₹)" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} className={inputClass} />
              <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium">Add</button>
            </form>
          </div>
        </div>
      )}

      {modal === "expense" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Add Expense</h3><button onClick={() => setModal(null)}><X size={22} /></button></div>
            <form onSubmit={submitExpense} className="space-y-4">
              <select required value={expForm.vehicleId} onChange={(e) => setExpForm({ ...expForm, vehicleId: e.target.value })} className={inputClass}>
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber || v.plateNumber}</option>)}
              </select>
              <select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })} className={inputClass}>
                <option>Toll</option><option>Parking</option><option>Fine</option><option>Other</option>
              </select>
              <input required type="number" placeholder="Amount (₹)" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} className={inputClass} />
              <input required placeholder="Description" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} className={inputClass} />
              <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium">Add</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}