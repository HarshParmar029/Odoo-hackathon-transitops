import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data: any = {};

    if (body.registrationNumber) data.plateNumber = body.registrationNumber;
    if (body.name) data.model = body.name;
    if (body.type) data.type = body.type;
    if (body.maxLoadCapacity !== undefined) data.capacity = Number(body.maxLoadCapacity);
    if (body.odometer !== undefined) data.mileage = Number(body.odometer);
    if (body.status) data.status = body.status;
    if (body.acquisitionCost !== undefined) data.acquisitionCost = body.acquisitionCost !== "" ? Number(body.acquisitionCost) : null;

    const vehicle = await prisma.vehicle.update({ where: { id: params.id }, data });

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

    return NextResponse.json({ message: "Vehicle updated", vehicle: out });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.vehicle.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Vehicle deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete vehicle. It may have linked trips/logs." }, { status: 500 });
  }
}
