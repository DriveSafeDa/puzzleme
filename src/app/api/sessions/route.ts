import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { puzzleId, difficulty, completed, durationSecs, hintsUsed } =
      await request.json();

    if (!puzzleId || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await prisma.puzzleSession.create({
      data: {
        puzzleId,
        difficulty,
        completed: completed || false,
        durationSecs: durationSecs || null,
        hintsUsed: hintsUsed || 0,
        completedAt: completed ? new Date() : null,
      },
    });

    // Update play count on puzzle
    if (completed) {
      await prisma.puzzle.update({
        where: { id: puzzleId },
        data: {
          timesPlayed: { increment: 1 },
        },
      });
    }

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (err: any) {
    console.error("Session error:", err?.message);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}
