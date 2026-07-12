import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const maintenance = await prisma.maintenance.findUnique({ where: { id: params.id }, include: { vehicle: true } });
    if (!maintenance) {
      return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedMaintenance = await tx.maintenance.update({ where: { id: params.id }, data: { status } });

      if (status === "COMPLETED" && maintenance.vehicle.status === "IN_SHOP") {
        await tx.vehicle.update({ where: { id: maintenance.vehicleId }, data: { status: "AVAILABLE" } });
      }

      return updatedMaintenance;
    });

    return NextResponse.json({ message: "Maintenance updated", maintenance: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update maintenance" }, { status: 500 });
  }
}
