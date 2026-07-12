import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const fuelEntries = await prisma.fuelEntry.findMany({ orderBy: { createdAt: "desc" }, include: { vehicle: true } });
    return NextResponse.json({ fuelEntries });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch fuel entries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicleId, amountLiters, cost } = body;

    if (!vehicleId || amountLiters === undefined || cost === undefined) {
      return NextResponse.json({ error: "Vehicle, amount and cost are required" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const fuelEntry = await prisma.fuelEntry.create({
      data: {
        vehicleId,
        amountLiters: Number(amountLiters),
        cost: Number(cost),
      },
    });

    return NextResponse.json({ message: "Fuel entry added", fuelEntry });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add fuel entry" }, { status: 500 });
  }
}
