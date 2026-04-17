import { prisma } from "@/lib/db";
import { WhoAreYou } from "@/components/WhoAreYou";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const residents = await prisma.resident.findMany({
    orderBy: { displayName: "asc" },
    select: {
      id: true,
      displayName: true,
      photoUrl: true,
      uploadCode: true,
      _count: { select: { puzzles: true } },
    },
  });

  if (residents.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">
            PuzzleMe
          </h1>
          <p className="mt-4 text-lg text-stone-500 leading-relaxed">
            Piece your memories together.
          </p>
          <p className="mt-6 text-sm text-stone-400 max-w-sm mx-auto">
            No residents have been added yet. Ask your Memory Care Director to
            set up your profile.
          </p>
        </div>
      </main>
    );
  }

  return <WhoAreYou residents={residents} />;
}
