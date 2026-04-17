import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose a Puzzle",
};

export default function PuzzleSelectPage({
  params,
}: {
  params: { code: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-2xl font-bold text-stone-900">Your Puzzles</h1>
        <p className="mt-2 text-sm text-stone-500">
          Pick a memory to piece together.
        </p>
        <p className="mt-8 text-xs text-stone-400">
          Puzzle selector coming soon — code: {params.code}
        </p>
      </div>
    </main>
  );
}
