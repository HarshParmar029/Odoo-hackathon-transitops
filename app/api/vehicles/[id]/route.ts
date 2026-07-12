import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    // map UI field names to DB fields if present
    const data: any = {};
    if (body.registrationNumber) data.plateNumber = body.registrationNumber;
    if (body.name) data.model = body.name;
    if (body.type) data.type = body.type;
    if (body.maxLoadCapacity !== undefined) data.capacity = Number(body.maxLoadCapacity);
    if (body.odometer !== undefined) data.mileage = Number(body.odometer);
    if (body.status) data.status = body.status;

    const vehicle = await prisma.vehicle.update({ where: { id: params.id }, data });

    const out = {
      id: vehicle.id,
      registrationNumber: vehicle.plateNumber,
      name: vehicle.model,
      type: vehicle.type,
      maxLoadCapacity: vehicle.capacity,
      odometer: vehicle.mileage,
      status: vehicle.status,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };

    return NextResponse.json({ message: "Vehicle updated", vehicle: out });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.vehicle.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Vehicle deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete vehicle. It may have linked trips/logs." }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        plateNumber: body.plateNumber,
        model: body.model,
        type: body.type,
        capacity: Number(body.capacity),
        status: body.status,
        mileage: body.mileage ? Number(body.mileage) : 0,
      },
    });
    return NextResponse.json({ vehicle });
  } catch {
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
