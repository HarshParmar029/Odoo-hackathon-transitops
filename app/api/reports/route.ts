import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        trips: true,
        fuelEntries: true,
        maintenance: true,
        expenses: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const reports = vehicles.map((vehicle) => {
      const completedTrips = vehicle.trips.filter((trip) => trip.status === "COMPLETED");
      const totalDistance = completedTrips.reduce((sum, trip) => sum + (trip.actualDistance ?? trip.plannedDistance ?? 0), 0);
      const totalFuel = vehicle.fuelEntries.reduce((sum, entry) => sum + entry.amountLiters, 0);
      const totalFuelCost = vehicle.fuelEntries.reduce((sum, entry) => sum + entry.cost, 0);
      const totalMaintenanceCost = vehicle.maintenance.reduce((sum, item) => sum + item.cost, 0);
      const totalExpenseCost = vehicle.expenses.reduce((sum, item) => sum + item.amount, 0);
      const totalOperatingCost = totalFuelCost + totalMaintenanceCost + totalExpenseCost;
      const fuelEfficiency = totalFuel > 0 ? Number((totalDistance / totalFuel).toFixed(2)) : null;
      const costPerKm = totalDistance > 0 ? Number((totalOperatingCost / totalDistance).toFixed(2)) : null;

      return {
        id: vehicle.id,
        registrationNumber: vehicle.plateNumber,
        model: vehicle.model,
        type: vehicle.type,
        status: vehicle.status,
        acquisitionCost: vehicle.acquisitionCost,
        totalDistance,
        totalFuel,
        totalFuelCost,
        totalMaintenanceCost,
        totalExpenseCost,
        totalOperatingCost,
        fuelEfficiency,
        costPerKm,
      };
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 });
  }
}
