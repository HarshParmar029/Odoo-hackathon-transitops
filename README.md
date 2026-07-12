# 🚛 TransitOps - Smart Transport Operations Platform

**Odoo Hackathon 2026 | Virtual Round Submission**
**Team Leader: Harsh Parmar**

A modern, rule-enforced fleet management platform that replaces spreadsheets and manual logbooks with automated transport operations — vehicle, driver, dispatch, maintenance, and expense management, all backed by real-time operational insights.

---

## 🎯 Why This Stands Out

- ✅ **All 10 Mandatory Business Rules** enforced server-side, not just on the UI
- ⚡ **Automatic Status Transitions** — Dispatch → On Trip, Complete → Available, Maintenance → In Shop, all happening live
- 📊 **Real-time KPI Dashboard** — Active Vehicles, Fleet Utilization, Active/Pending Trips, and more
- 🎨 **Clean, Responsive SaaS-style UI** with color-coded status badges
- 🔐 **Secure Auth** with Role-Based Access Control (RBAC)
- 📁 **Full CRUD + Validations** across Vehicles, Drivers, and Trips

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Prisma ORM + SQLite |
| Auth | JWT (jose for Edge middleware) + bcrypt password hashing |
| UI | Lucide Icons, Sonner (toasts), Recharts |

---

## ✨ Key Features

### Core Modules
- **Authentication** — Secure login/signup with RBAC (Fleet Manager, Driver, Safety Officer, Financial Analyst)
- **Dashboard** — Live KPIs: Active Vehicles, Available Vehicles, In Maintenance, Active/Pending Trips, Drivers On Duty, Fleet Utilization %
- **Vehicle Registry** — Full CRUD with unique registration number validation and status tracking (Available / On Trip / In Shop / Retired)
- **Driver Management** — Full CRUD with license expiry tracking and status control (Available / On Trip / Off Duty / Suspended)
- **Trip Management** — Create, dispatch, complete, and cancel trips with full validation and automatic status transitions
- **Maintenance** — Maintenance logs automatically move vehicles to "In Shop" and restore them on closure
- **Fuel & Expense Tracking** — Per-vehicle fuel and expense logging with automatic operational cost calculation
- **Reports & Analytics** — Fuel efficiency, operational cost, and ROI per vehicle, with CSV export

### ✅ Mandatory Business Rules (All Enforced Server-Side)
1. Vehicle registration number must be unique
2. Retired/In Shop vehicles never appear in the dispatch selection
3. Drivers with expired license or Suspended status cannot be assigned
4. A driver/vehicle already On Trip cannot be reassigned to another trip
5. Cargo weight cannot exceed the vehicle's maximum load capacity
6. Dispatching a trip automatically sets vehicle + driver to On Trip
7. Completing a trip automatically restores vehicle + driver to Available
8. Cancelling a dispatched trip restores vehicle + driver to Available
9. Creating an active maintenance record automatically sets vehicle to In Shop
10. Closing maintenance restores the vehicle to Available (unless Retired)

---

## 🚀 Quick Start

```bash
git clone https://github.com/HarshParmar029/Odoo-hackathon-transitops.git
cd Odoo-hackathon-transitops
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000` → redirects to `/login`. Sign up to create your first account.

---

## 📋 Example Workflow (As Per Spec)

1. Register vehicle **Van-05** with max capacity 500kg — status `Available`
2. Register driver **Alex** with a valid driving license
3. Create a trip with cargo weight 450kg → system validates `450 ≤ 500` → trip dispatched
4. Vehicle and Driver statuses automatically become `On Trip`
5. Complete the trip → both statuses automatically restored to `Available`
6. Create a maintenance record (e.g., Oil Change) → vehicle automatically becomes `In Shop`, hidden from dispatch
7. Reports update operational cost and fuel efficiency based on the latest trip and fuel log

---

## 📊 Database Schema

**Entities:** `User`, `Vehicle`, `Driver`, `Trip`, `MaintenanceLog`, `FuelLog`, `Expense`

All relationships are enforced at the database level via Prisma, with cascading business logic handled in transactional API routes to guarantee data consistency (e.g., dispatching a trip updates the trip, vehicle, and driver in a single atomic transaction).

---

## 📸 Screenshots

*(Add screenshots here before final submission)*

- Dashboard with live KPIs
- Vehicle Registry with status badges
- Trip creation with real-time validation
- Reports & Analytics page

---

## 🔮 Future Enhancements

- Email reminders for expiring driver licenses
- Dark mode
- Advanced filters (region, type, date range)
- PDF export for reports
- Vehicle document management

---

## 🏆 Why This Wins

- Complete, end-to-end working platform — not a partial prototype
- Every mandatory business rule strictly implemented and tested
- Professional, responsive UI backed by real, persisted data
- Built and demo-ready within the 8-hour hackathon window

---

**Built with passion for Odoo Hackathon 2026**
**Team Leader:** Harsh Parmar
**GitHub:** [@HarshParmar029](https://github.com/HarshParmar029)
**Submission Date:** 12 July 2026
