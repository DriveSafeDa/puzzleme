"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface Resident {
  id: string;
  displayName: string;
  photoUrl: string | null;
  uploadCode: string;
  _count: { puzzles: number };
}

export function WhoAreYou({ residents }: { residents: Resident[] }) {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight text-center">
        Who are you?
      </h1>
      <p className="mt-2 text-stone-500 text-base">
        Tap your photo to start.
      </p>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl w-full">
        {residents.map((r) => (
          <button
            key={r.id}
            onClick={() => router.push(`/play/${r.uploadCode}`)}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border-2 border-cream-300 hover:border-stone-400 transition-all hover:shadow-lg active:scale-95"
          >
            {r.photoUrl ? (
              <Image
                src={r.photoUrl}
                alt={r.displayName}
                width={120}
                height={120}
                className="w-28 h-28 rounded-full object-cover border-4 border-cream-200"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-cream-200 flex items-center justify-center border-4 border-cream-300">
                <span className="text-4xl font-bold text-stone-400">
                  {r.displayName.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-lg font-semibold text-stone-800">
              {r.displayName}
            </span>
            {r._count.puzzles > 0 && (
              <span className="text-xs text-stone-400">
                {r._count.puzzles} {r._count.puzzles === 1 ? "puzzle" : "puzzles"}
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="mt-12 text-[10px] text-stone-300">puzzleme.app</p>
    </main>
  );
}
