import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({ include: { vehicle: true, driver: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ trips });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = body;

    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });

    if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });

    if (vehicle.status === "RETIRED" || vehicle.status === "IN_SHOP") {
      return NextResponse.json({ error: `Vehicle is ${vehicle.status.replace("_", " ")} and cannot be dispatched` }, { status: 400 });
    }

    if (vehicle.status === "ON_TRIP") {
      return NextResponse.json({ error: "Vehicle is already on a trip" }, { status: 400 });
    }

    if (driver.status === "SUSPENDED") {
      return NextResponse.json({ error: "Driver is suspended and cannot be assigned" }, { status: 400 });
    }

    if (!driver.licenseExpiryDate || new Date(driver.licenseExpiryDate) < new Date()) {
      return NextResponse.json({ error: "Driver license is expired or invalid and cannot be assigned" }, { status: 400 });
    }

    if (driver.status === "ON_TRIP") {
      return NextResponse.json({ error: "Driver is already on a trip" }, { status: 400 });
    }

    const cargo = parseFloat(cargoWeight);
    if (isNaN(cargo) || cargo > vehicle.capacity) {
      return NextResponse.json({ error: `Cargo weight (${cargoWeight}kg) exceeds vehicle's max capacity (${vehicle.capacity}kg)` }, { status: 400 });
    }

    const trip = await prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          routeName: `${source} → ${destination}`,
          origin: source,
          destination,
          cargoWeight: Number(cargo),
          plannedDistance: Number(plannedDistance),
          distanceKm: Math.round(Number(plannedDistance) || 0),
          startTime: new Date(),
          status: "DISPATCHED",
          vehicleId,
          driverId,
        },
      });

      await tx.vehicle.update({ where: { id: vehicleId }, data: { status: "ON_TRIP" } });
      await tx.driver.update({ where: { id: driverId }, data: { status: "ON_TRIP" } });

      return newTrip;
    });

    return NextResponse.json({ message: "Trip created and dispatched", trip });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
