import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const maintenanceRecords = await prisma.maintenance.findMany({
      orderBy: { createdAt: "desc" },
      include: { vehicle: true, driver: true },
    });

    return NextResponse.json({ maintenance: maintenanceRecords });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch maintenance records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, cost, vehicleId, driverId } = body;

    if (!title || !description || cost === undefined || !vehicleId) {
      return NextResponse.json({ error: "Title, description, cost, and vehicle are required" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    if (vehicle.status === "RETIRED") {
      return NextResponse.json({ error: "Retired vehicles cannot enter maintenance" }, { status: 400 });
    }

    const driver = driverId ? await prisma.driver.findUnique({ where: { id: driverId } }) : null;
    if (driverId && !driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const newRecord = await prisma.$transaction(async (tx) => {
      const maintenance = await tx.maintenance.create({
        data: {
          title,
          description,
          cost: Number(cost),
          status: "PENDING",
          vehicleId,
          driverId: driver ? driver.id : null,
        },
      });

      await tx.vehicle.update({ where: { id: vehicleId }, data: { status: "IN_SHOP" } });
      return maintenance;
    });

    return NextResponse.json({ message: "Maintenance record created", maintenance: newRecord });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create maintenance record" }, { status: 500 });
  }
}