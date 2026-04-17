import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play",
};

export default function PuzzleGamePage({
  params,
}: {
  params: { code: string; puzzleId: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-900">Puzzle</h1>
        <p className="mt-2 text-sm text-stone-500">
          Puzzle board coming soon.
        </p>
        <p className="mt-8 text-xs text-stone-400">
          code: {params.code} | puzzle: {params.puzzleId}
        </p>
      </div>
    </main>
  );
}
