import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { code, imageUrl, imageData, caption, uploadedBy } = await request.json();

    if (!code || (!imageUrl && !imageData)) {
      return NextResponse.json({ error: "Missing code or image" }, { status: 400 });
    }

    const resident = await prisma.resident.findUnique({
      where: { uploadCode: code },
    });

    if (!resident) {
      return NextResponse.json({ error: "Invalid upload code" }, { status: 404 });
    }

    // Use imageUrl if provided (API seeding), otherwise use base64 data URL
    const finalUrl = imageUrl || imageData;

    if (!finalUrl) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Limit base64 size (~10MB)
    if (imageData && imageData.length > 10_000_000) {
      return NextResponse.json({ error: "Image too large — max 10MB" }, { status: 413 });
    }

    const puzzle = await prisma.puzzle.create({
      data: {
        residentId: resident.id,
        imageUrl: finalUrl,
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
