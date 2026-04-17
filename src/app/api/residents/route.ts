import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const { displayName, photoUrl } = await request.json();

    if (!displayName?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const resident = await prisma.resident.create({
      data: {
        displayName: displayName.trim(),
        photoUrl: photoUrl || null,
        uploadCode: generateCode(),
      },
    });

    return NextResponse.json({
      success: true,
      resident: {
        id: resident.id,
        displayName: resident.displayName,
        uploadCode: resident.uploadCode,
      },
    });
  } catch (err: any) {
    console.error("Create resident error:", err?.message);
    return NextResponse.json({ error: "Failed to create resident" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const residents = await prisma.resident.findMany({
      orderBy: { displayName: "asc" },
      include: { _count: { select: { puzzles: true } } },
    });
    return NextResponse.json({ residents });
  } catch (err: any) {
    console.error("List residents error:", err?.message);
    return NextResponse.json({ error: "Failed to list residents" }, { status: 500 });
  }
}
