"use client";
import { useState, useEffect } from "react";
import { Download, FileBarChart } from "lucide-react";

interface VehicleReport {
  id: string;
  registrationNumber: string;
  model: string;
  type: string;
  status: string;
  acquisitionCost: number;
  totalDistance: number;
  totalFuel: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalExpenseCost: number;
  totalOperatingCost: number;
  fuelEfficiency: number | null;
  costPerKm: number | null;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<VehicleReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => setReports(d.reports || []))
      .finally(() => setLoading(false));
  }, []);

  const roi = (r: VehicleReport) => {
    if (!r.acquisitionCost) return 0;
    return (0 - (r.totalFuelCost + r.totalMaintenanceCost)) / r.acquisitionCost;
  };

  const exportCSV = () => {
    const headers = ["Registration", "Model", "Type", "Total Distance (km)", "Fuel Efficiency (km/L)", "Fuel Cost", "Maintenance Cost", "Expenses", "Total Operating Cost", "ROI (%)"];
    const rows = reports.map((r) => [
      r.registrationNumber, r.model, r.type, r.totalDistance,
      r.fuelEfficiency ?? "N/A", r.totalFuelCost.toFixed(2), r.totalMaintenanceCost.toFixed(2),
      r.totalExpenseCost.toFixed(2), r.totalOperatingCost.toFixed(2), (roi(r) * 100).toFixed(2),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transitops_report.csv";
    a.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-500 mt-1">Fuel efficiency, operational cost & ROI per vehicle</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-400">Loading...</p>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center">
            <FileBarChart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">No data yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3">Distance</th>
                <th className="px-6 py-3">Fuel Efficiency</th>
                <th className="px-6 py-3">Fuel Cost</th>
                <th className="px-6 py-3">Maintenance Cost</th>
                <th className="px-6 py-3">Operating Cost</th>
                <th className="px-6 py-3">ROI</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium">{r.registrationNumber} - {r.model}</td>
                  <td className="px-6 py-4">{r.totalDistance} km</td>
                  <td className="px-6 py-4">{r.fuelEfficiency ? `${r.fuelEfficiency} km/L` : "—"}</td>
                  <td className="px-6 py-4">₹{r.totalFuelCost.toFixed(2)}</td>
                  <td className="px-6 py-4">₹{r.totalMaintenanceCost.toFixed(2)}</td>
                  <td className="px-6 py-4 font-medium">₹{r.totalOperatingCost.toFixed(2)}</td>
                  <td className={`px-6 py-4 font-medium ${roi(r) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {(roi(r) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}