"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function CelebrationOverlay({
  imageUrl,
  caption,
  uploadedBy,
  residentName,
  code,
  puzzleId,
  gridSize,
}: {
  imageUrl: string;
  caption: string | null;
  uploadedBy: string | null;
  residentName: string;
  code: string;
  puzzleId: string;
  gridSize: number;
}) {
  const router = useRouter();
  const [stage, setStage] = useState(0);

  // Staged reveal
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 300); // photo appears
    const t2 = setTimeout(() => setStage(2), 1200); // caption fades in
    const t3 = setTimeout(() => setStage(3), 2000); // buttons appear
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-[#FAF8F5]">
      {/* Confetti burst */}
      {stage >= 0 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-sm animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: [
                  "#22C55E",
                  "#3B82F6",
                  "#F59E0B",
                  "#EC4899",
                  "#8B5CF6",
                  "#EF4444",
                ][i % 6],
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Full photo reveal */}
      <div
        className={`max-w-lg w-full transition-all duration-1000 ${
          stage >= 1
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
          <img
            src={imageUrl}
            alt="Your completed memory"
            className="w-full object-contain"
          />
        </div>
      </div>

      {/* Caption */}
      <div
        className={`mt-6 text-center max-w-md transition-all duration-700 ${
          stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {caption && (
          <p className="text-xl md:text-2xl text-stone-800 font-serif italic leading-relaxed">
            &ldquo;{caption}&rdquo;
          </p>
        )}
        {uploadedBy && (
          <p className="mt-2 text-stone-400 text-sm">— {uploadedBy}</p>
        )}
        <p className="mt-4 text-2xl font-bold text-stone-900">
          You did it, {residentName}!
        </p>
      </div>

      {/* Buttons */}
      <div
        className={`mt-8 flex gap-4 transition-all duration-500 ${
          stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <button
          onClick={() =>
            router.push(`/play/${code}/${puzzleId}?grid=${gridSize}`)
          }
          className="px-8 py-4 rounded-2xl bg-white border-2 border-cream-300 text-stone-700 font-bold text-lg hover:border-stone-400 transition-all active:scale-95"
        >
          Play Again
        </button>
        <button
          onClick={() => router.push(`/play/${code}`)}
          className="px-8 py-4 rounded-2xl bg-stone-900 text-white font-bold text-lg hover:bg-stone-800 transition-all active:scale-95"
        >
          Another Puzzle
        </button>
      </div>
    </main>
  );
}
