import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { PuzzleSelector } from "@/components/PuzzleSelector";

export const dynamic = "force-dynamic";

export default async function PuzzleSelectPage({
  params,
}: {
  params: { code: string };
}) {
  const resident = await prisma.resident.findUnique({
    where: { uploadCode: params.code },
    include: {
      puzzles: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!resident) redirect("/");

  return (
    <PuzzleSelector
      residentName={resident.displayName}
      code={params.code}
      puzzles={resident.puzzles.map((p) => ({
        id: p.id,
        imageUrl: p.imageUrl,
        caption: p.caption,
        uploadedBy: p.uploadedBy,
        timesPlayed: p.timesPlayed,
      }))}
    />
  );
}
