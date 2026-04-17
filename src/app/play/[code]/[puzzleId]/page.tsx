import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { PuzzleGame } from "@/components/PuzzleGame";

export const dynamic = "force-dynamic";

export default async function PuzzleGamePage({
  params,
  searchParams,
}: {
  params: { code: string; puzzleId: string };
  searchParams: { grid?: string };
}) {
  const puzzle = await prisma.puzzle.findUnique({
    where: { id: params.puzzleId },
    include: { resident: true },
  });

  if (!puzzle || puzzle.resident.uploadCode !== params.code) redirect("/");

  const gridSize = Math.min(Math.max(parseInt(searchParams.grid || "3"), 2), 4);

  return (
    <PuzzleGame
      puzzleId={puzzle.id}
      imageUrl={puzzle.imageUrl}
      caption={puzzle.caption}
      uploadedBy={puzzle.uploadedBy}
      residentName={puzzle.resident.displayName}
      gridSize={gridSize}
      code={params.code}
    />
  );
}
