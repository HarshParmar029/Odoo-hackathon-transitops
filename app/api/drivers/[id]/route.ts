import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    // map UI fields to Prisma fields
    const data: Record<string, any> = {};
    if (body.name) data.name = body.name;
    if (body.licenseNumber) data.licenseNo = body.licenseNumber;
    if (body.contactNumber) data.phone = body.contactNumber;
    if (body.licenseExpiryDate) data.licenseExpiryDate = new Date(body.licenseExpiryDate);
    if (body.status) data.status = body.status;
    if (typeof body.safetyScore !== "undefined") data.experience = Math.round(Number(body.safetyScore) || 0);

    const driver = await prisma.driver.update({ where: { id: params.id }, data });
    return NextResponse.json({ message: "Driver updated", driver });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.driver.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Driver deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete driver. It may have linked trips." }, { status: 500 });
  }
}
