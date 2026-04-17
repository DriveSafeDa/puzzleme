import { prisma } from "@/lib/db";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const residents = await prisma.resident.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { puzzles: true } },
    },
  });

  return (
    <AdminDashboard
      residents={residents.map((r) => ({
        id: r.id,
        displayName: r.displayName,
        photoUrl: r.photoUrl,
        uploadCode: r.uploadCode,
        puzzleCount: r._count.puzzles,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
