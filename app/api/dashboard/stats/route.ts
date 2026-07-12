import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [activeVehicles, availableVehicles, inShopVehicles, activeTrips, pendingTrips, driversOnDuty, totalVehicles] =
      await Promise.all([
        prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
        prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
        prisma.vehicle.count({ where: { status: "IN_SHOP" } }),
        prisma.trip.count({ where: { status: "DISPATCHED" } }),
        prisma.trip.count({ where: { status: "DRAFT" } }),
        prisma.driver.count({ where: { status: "ON_TRIP" } }),
        prisma.vehicle.count(),
      ]);

    const utilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    return NextResponse.json({
      activeVehicles,
      availableVehicles,
      inShopVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization: utilization,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [activeVehicles, availableVehicles, inShopVehicles, activeTrips, pendingTrips, driversOnDuty, totalVehicles] = await Promise.all([
      prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
      prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
      prisma.vehicle.count({ where: { status: "IN_SHOP" } }),
      prisma.trip.count({ where: { status: "DISPATCHED" } }),
      prisma.trip.count({ where: { status: "DRAFT" } }),
      prisma.driver.count({ where: { status: "ON_TRIP" } }),
      prisma.vehicle.count(),
    ]);

    const utilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    return NextResponse.json({
      activeVehicles,
      availableVehicles,
      inShopVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization: utilization,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
