import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } });

    const vehicles = rows.map((v) => ({
      id: v.id,
      registrationNumber: v.plateNumber,
      name: v.model,
      type: v.type,
      maxLoadCapacity: v.capacity,
      odometer: v.mileage,
      acquisitionCost: v.acquisitionCost,
      status: v.status,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost } = body;

    if (!registrationNumber || !name || !type || !maxLoadCapacity || acquisitionCost === undefined) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const existing = await prisma.vehicle.findUnique({ where: { plateNumber: registrationNumber } });
    if (existing) {
      return NextResponse.json({ error: "Registration number already exists" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber: registrationNumber,
        model: name,
        type,
        capacity: Number(maxLoadCapacity) || 0,
        mileage: Number(odometer) || 0,
        acquisitionCost: acquisitionCost !== "" ? Number(acquisitionCost) : null,
      },
    });

    const out = {
      id: vehicle.id,
      registrationNumber: vehicle.plateNumber,
      name: vehicle.model,
      type: vehicle.type,
      maxLoadCapacity: vehicle.capacity,
      odometer: vehicle.mileage,
      acquisitionCost: vehicle.acquisitionCost,
      status: vehicle.status,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };

    return NextResponse.json({ message: "Vehicle added", vehicle: out });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
