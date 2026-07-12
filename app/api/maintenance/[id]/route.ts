import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const maintenance = await prisma.maintenance.findUnique({ where: { id } });
    if (!maintenance) {
      return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.maintenance.update({
        where: { id },
        data: { status: status || "COMPLETED" },
      });

      const vehicle = await tx.vehicle.findUnique({ where: { id: maintenance.vehicleId } });
      if (vehicle && vehicle.status !== "RETIRED") {
        await tx.vehicle.update({ where: { id: maintenance.vehicleId }, data: { status: "AVAILABLE" } });
      }

      return record;
    });

    return NextResponse.json({ message: "Maintenance closed", maintenance: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update maintenance record" }, { status: 500 });
  }
}