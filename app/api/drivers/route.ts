import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.driver.findMany({ orderBy: { createdAt: "desc" } });

    // map DB shape to UI shape
    const drivers = rows.map((d) => ({
      id: d.id,
      name: d.name,
      licenseNumber: d.licenseNo,
      licenseCategory: "LMV",
      licenseExpiryDate: d.licenseExpiryDate || null,
      contactNumber: d.phone,
      safetyScore: d.experience ?? 0,
      status: d.status,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, licenseNumber, contactNumber } = body;

    if (!name || !licenseNumber || !contactNumber) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const existing = await prisma.driver.findUnique({ where: { licenseNo: licenseNumber } });
    if (existing) {
      return NextResponse.json({ error: "License number already exists" }, { status: 400 });
    }

    const email = body.email || `${licenseNumber.replace(/\s+/g, "_")}@noemail.local`;

    const driver = await prisma.driver.create({
      data: {
        name,
        licenseNo: licenseNumber,
        phone: contactNumber,
        email,
        status: "AVAILABLE",
        experience: 0,
        licenseExpiryDate: body.licenseExpiryDate ? new Date(body.licenseExpiryDate) : null,
      },
    });

    // return UI shape
    const out = {
      id: driver.id,
      name: driver.name,
      licenseNumber: driver.licenseNo,
      licenseCategory: "LMV",
      licenseExpiryDate: driver.licenseExpiryDate || null,
      contactNumber: driver.phone,
      safetyScore: driver.experience ?? 0,
      status: driver.status,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
    };

    return NextResponse.json({ message: "Driver added", driver: out });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || String(error) || "Failed to create driver" }, { status: 500 });
  }
}
