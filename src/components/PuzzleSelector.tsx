"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DifficultyPicker } from "./DifficultyPicker";

interface PuzzleCard {
  id: string;
  imageUrl: string;
  caption: string | null;
  uploadedBy: string | null;
  timesPlayed: number;
}

export function PuzzleSelector({
  residentName,
  code,
  puzzles,
}: {
  residentName: string;
  code: string;
  puzzles: PuzzleCard[];
}) {
  const router = useRouter();
  const [selectedPuzzle, setSelectedPuzzle] = useState<string | null>(null);

  if (selectedPuzzle) {
    return (
      <DifficultyPicker
        onSelect={(gridSize) =>
          router.push(`/play/${code}/${selectedPuzzle}?grid=${gridSize}`)
        }
        onBack={() => setSelectedPuzzle(null)}
      />
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
              Hi, {residentName}!
            </h1>
            <p className="mt-1 text-stone-500 text-base">
              Pick a memory to piece together.
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-xl text-sm text-stone-500 hover:bg-cream-200 transition"
          >
            Not me
          </button>
        </div>

        {puzzles.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-stone-400 text-lg">No puzzles yet!</p>
            <p className="mt-2 text-stone-400 text-sm">
              Ask your family to upload a photo at{" "}
              <span className="font-mono text-stone-500">
                puzzleme.app/upload/{code}
              </span>
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {puzzles.map((puzzle) => (
              <button
                key={puzzle.id}
                onClick={() => setSelectedPuzzle(puzzle.id)}
                className="group relative overflow-hidden rounded-2xl border-2 border-cream-300 hover:border-stone-400 transition-all hover:shadow-lg active:scale-[0.98] bg-white"
              >
                <div className="aspect-[4/3] relative">
                  <Image
                    src={puzzle.imageUrl}
                    alt={puzzle.caption || "Memory"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 text-left">
                  {puzzle.caption && (
                    <p className="text-stone-700 text-sm font-medium leading-snug line-clamp-2">
                      &ldquo;{puzzle.caption}&rdquo;
                    </p>
                  )}
                  {puzzle.uploadedBy && (
                    <p className="mt-1 text-stone-400 text-xs">
                      From {puzzle.uploadedBy}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
