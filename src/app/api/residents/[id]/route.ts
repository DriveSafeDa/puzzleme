import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete sessions first, then puzzles, then resident
    await prisma.puzzleSession.deleteMany({
      where: { puzzle: { residentId: params.id } },
    });
    await prisma.puzzle.deleteMany({
      where: { residentId: params.id },
    });
    await prisma.resident.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete resident error:", err?.message);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
