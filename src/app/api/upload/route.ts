import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// TODO: Add R2 presigned upload in Phase 2
// For now, this creates a puzzle record with an external image URL

export async function POST(request: NextRequest) {
  try {
    const { code, imageUrl, caption, uploadedBy } = await request.json();

    if (!code || !imageUrl) {
      return NextResponse.json({ error: "Missing code or imageUrl" }, { status: 400 });
    }

    const resident = await prisma.resident.findUnique({
      where: { uploadCode: code },
    });

    if (!resident) {
      return NextResponse.json({ error: "Invalid upload code" }, { status: 404 });
    }

    const puzzle = await prisma.puzzle.create({
      data: {
        residentId: resident.id,
        imageUrl,
        caption: caption || null,
        uploadedBy: uploadedBy || null,
      },
    });

    return NextResponse.json({ success: true, puzzleId: puzzle.id });
  } catch (err: any) {
    console.error("Upload error:", err?.message);
    return NextResponse.json({ error: "Failed to create puzzle" }, { status: 500 });
  }
}
