import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const resident = await prisma.resident.findUnique({
      where: { uploadCode: params.code },
      include: {
        puzzles: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!resident) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 });
    }

    return NextResponse.json({
      resident: { id: resident.id, displayName: resident.displayName },
      puzzles: resident.puzzles,
    });
  } catch (err: any) {
    console.error("Puzzles fetch error:", err?.message);
    return NextResponse.json({ error: "Failed to load puzzles" }, { status: 500 });
  }
}
