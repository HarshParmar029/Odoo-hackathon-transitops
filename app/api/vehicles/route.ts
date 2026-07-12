import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } });

    // map DB shape to UI shape expected by frontend
    const vehicles = rows.map((v) => ({
      id: v.id,
      registrationNumber: v.plateNumber,
      name: v.model,
      type: v.type,
      maxLoadCapacity: v.capacity,
      odometer: v.mileage,
      acquisitionCost: null,
      status: v.status,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));

    return NextResponse.json({ vehicles });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost } = body;

    if (!registrationNumber || !name || !type || !maxLoadCapacity || !acquisitionCost) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    // check unique plateNumber (mapped from registrationNumber)
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
      },
    });

    // return shape expected by UI (include acquisitionCost in response even if not persisted)
    const out = {
      id: vehicle.id,
      registrationNumber: vehicle.plateNumber,
      name: vehicle.model,
      type: vehicle.type,
      maxLoadCapacity: vehicle.capacity,
      odometer: vehicle.mileage,
      acquisitionCost: Number(acquisitionCost) || null,
      status: vehicle.status,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };

    return NextResponse.json({ message: "Vehicle added", vehicle: out });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
