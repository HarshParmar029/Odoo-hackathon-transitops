import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, actualDistance, fuelConsumed } = body;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    if (trip.status !== "DISPATCHED") {
      return NextResponse.json({ error: "Only dispatched trips can be completed or cancelled" }, { status: 400 });
    }

    if (action === "complete") {
      const updatedTrip = await prisma.$transaction(async (tx) => {
        const t = await tx.trip.update({
          where: { id },
          data: {
            status: "COMPLETED",
            actualDistance: actualDistance ? Number(actualDistance) : trip.plannedDistance,
            fuelConsumed: fuelConsumed ? Number(fuelConsumed) : null,
            endTime: new Date(),
          },
        });

        const km = Math.round(actualDistance ? Number(actualDistance) : trip.plannedDistance || 0);
        await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { mileage: { increment: km }, status: "AVAILABLE" } });
        await tx.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } });
        return t;
      });

      return NextResponse.json({ message: "Trip completed", trip: updatedTrip });
    }

    if (action === "cancel") {
      const updatedTrip = await prisma.$transaction(async (tx) => {
        const t = await tx.trip.update({ where: { id }, data: { status: "CANCELLED" } });
        await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE" } });
        await tx.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } });
        return t;
      });

      return NextResponse.json({ message: "Trip cancelled", trip: updatedTrip });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}