"use client";

import { useEffect, useState } from "react";
import { Truck, CheckCircle, Wrench, MapPin, Clock, Users, Gauge } from "lucide-react";

interface Stats {
  activeVehicles: number;
  availableVehicles: number;
  inShopVehicles: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const cards = [
    { label: "Active Vehicles", value: stats?.activeVehicles, icon: Truck, color: "text-blue-600 bg-blue-50" },
    { label: "Available Vehicles", value: stats?.availableVehicles, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
    { label: "In Maintenance", value: stats?.inShopVehicles, icon: Wrench, color: "text-orange-600 bg-orange-50" },
    { label: "Active Trips", value: stats?.activeTrips, icon: MapPin, color: "text-purple-600 bg-purple-50" },
    { label: "Pending Trips", value: stats?.pendingTrips, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Drivers On Duty", value: stats?.driversOnDuty, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Fleet Utilization", value: stats ? `${stats.fleetUtilization}%` : undefined, icon: Gauge, color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Fleet Overview</h2>
        <p className="text-slate-500 mt-1">Real-time snapshot of your transport operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon as any;
          return (
            <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
                <Icon size={22} />
              </div>
              <p className="text-3xl font-bold text-slate-800">{card.value ?? "—"}</p>
              <p className="mt-1 text-sm text-slate-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a href="/dashboard/trips" className="rounded-xl bg-slate-900 px-4 py-4 text-center text-sm font-medium text-white transition hover:bg-slate-800">
            + New Trip
          </a>
          <a href="/dashboard/vehicles" className="rounded-xl bg-slate-900 px-4 py-4 text-center text-sm font-medium text-white transition hover:bg-slate-800">
            + Add Vehicle
          </a>
          <a href="/dashboard/drivers" className="rounded-xl bg-slate-900 px-4 py-4 text-center text-sm font-medium text-white transition hover:bg-slate-800">
            + Add Driver
          </a>
          <a href="/dashboard/reports" className="rounded-xl bg-slate-900 px-4 py-4 text-center text-sm font-medium text-white transition hover:bg-slate-800">
            View Reports
          </a>
        </div>
      </div>
    </div>
  );
}
