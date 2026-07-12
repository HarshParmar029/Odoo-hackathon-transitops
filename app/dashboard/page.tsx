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
          <h2 className="text-3xl font-bold text-slate-800 mb-1">Fleet Overview</h2>
          <p className="text-slate-500 mb-8">Real-time snapshot of your transport operations</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card) => {
              const Icon = card.icon as any;
              return (
                <div key={card.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                    <Icon size={22} />
                  </div>
                  <p className="text-3xl font-bold text-slate-800">{card.value ?? "—"}</p>
                  <p className="text-slate-500 text-sm mt-1">{card.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/dashboard/trips" className="bg-slate-900 text-white py-4 rounded-xl text-center font-medium hover:bg-slate-800 transition">
                + New Trip
              </a>
              <a href="/dashboard/vehicles" className="bg-slate-900 text-white py-4 rounded-xl text-center font-medium hover:bg-slate-800 transition">
                + Add Vehicle
              </a>
              <a href="/dashboard/drivers" className="bg-slate-900 text-white py-4 rounded-xl text-center font-medium hover:bg-slate-800 transition">
                + Add Driver
              </a>
              <a href="/dashboard/reports" className="bg-slate-900 text-white py-4 rounded-xl text-center font-medium hover:bg-slate-800 transition">
                View Reports
              </a>
            </div>
          </div>
        </div>
      );
    }
