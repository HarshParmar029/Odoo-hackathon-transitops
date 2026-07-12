"use client";

export default function FuelPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Fuel & Expense Tracking</h2>
        <p className="text-slate-500 mt-1">Log fuel purchases and operational expenses for every vehicle.</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-slate-600">This page is under construction. The back-end now supports fuel and expense records via <code>/api/fuel</code> and <code>/api/expenses</code>.</p>
      </div>
    </div>
  );
}
