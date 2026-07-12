import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { createdAt: "desc" }, include: { vehicle: true } });
    return NextResponse.json({ expenses });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicleId, category, amount, description } = body;

    if (!vehicleId || !category || amount === undefined || !description) {
      return NextResponse.json({ error: "Vehicle, category, amount and description are required" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const expense = await prisma.expense.create({
      data: {
        vehicleId,
        category,
        amount: Number(amount),
        description,
      },
    });

    return NextResponse.json({ message: "Expense added", expense });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 });
  }
}
