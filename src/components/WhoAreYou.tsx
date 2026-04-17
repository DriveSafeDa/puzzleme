"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Resident {
  id: string;
  displayName: string;
  photoUrl: string | null;
  uploadCode: string;
  _count: { puzzles: number };
}

const CARD_COLORS = [
  { bg: "from-amber-300 to-orange-400", ring: "ring-amber-400", emoji: "🌻" },
  { bg: "from-sky-300 to-blue-400", ring: "ring-sky-400", emoji: "🦋" },
  { bg: "from-emerald-300 to-green-400", ring: "ring-emerald-400", emoji: "🌿" },
  { bg: "from-pink-300 to-rose-400", ring: "ring-pink-400", emoji: "🌸" },
  { bg: "from-violet-300 to-purple-400", ring: "ring-violet-400", emoji: "⭐" },
  { bg: "from-teal-300 to-cyan-400", ring: "ring-teal-400", emoji: "🐚" },
];

export function WhoAreYou({ residents }: { residents: Resident[] }) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  function handleSelect(code: string) {
    router.push(`/play/${code}`);
  }

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(residents.length - 1, index));
    setActiveIndex(clamped);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      goTo(activeIndex + (dx < 0 ? 1 : -1));
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 50%, #ECFDF5 100%)" }}
    >
      {/* Floating decorative shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-amber-200/40 animate-float" />
        <div className="absolute top-32 right-16 w-14 h-14 rounded-2xl bg-sky-200/40 animate-float-delay" />
        <div className="absolute bottom-20 left-20 w-16 h-16 rounded-full bg-emerald-200/40 animate-float" />
        <div className="absolute bottom-32 right-10 w-12 h-12 rounded-2xl bg-pink-200/40 animate-float-delay" />
      </div>

      {/* Title */}
      <div className="text-center mb-8 z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight"
          style={{ color: "#1E293B" }}
        >
          Who are you? 👋
        </h1>
        <p className="mt-3 text-lg text-stone-500 font-medium">
          Swipe or tap to find yourself!
        </p>
      </div>

      {/* Card carousel */}
      <div
        ref={scrollRef}
        className="relative w-full max-w-lg z-10 px-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative" style={{ height: 380 }}>
          {residents.map((r, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
            const offset = i - activeIndex;
            const isActive = offset === 0;

            return (
              <div
                key={r.id}
                onClick={() => isActive ? handleSelect(r.uploadCode) : goTo(i)}
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ease-out"
                style={{
                  transform: `translateX(${offset * 110}%) scale(${isActive ? 1 : 0.8}) rotateY(${offset * -8}deg)`,
                  opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.6,
                  zIndex: isActive ? 10 : 5 - Math.abs(offset),
                  pointerEvents: Math.abs(offset) > 1 ? "none" : "auto",
                }}
              >
                <div
                  className={`w-full max-w-xs rounded-3xl p-8 flex flex-col items-center gap-4 bg-gradient-to-br ${color.bg} shadow-xl ${
                    isActive ? "shadow-2xl ring-4 " + color.ring + "/30" : ""
                  } transition-shadow duration-300`}
                >
                  {/* Avatar */}
                  <div className={`relative rounded-full bg-white/80 p-2 ${isActive ? "animate-gentle-bounce" : ""}`}>
                    {r.photoUrl ? (
                      <Image
                        src={r.photoUrl}
                        alt={r.displayName}
                        width={140}
                        height={140}
                        className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white flex items-center justify-center">
                        <span className="text-6xl">{color.emoji}</span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center drop-shadow-sm">
                    {r.displayName}
                  </h2>

                  {r._count.puzzles > 0 && (
                    <span className="px-3 py-1 rounded-full bg-white/30 text-white text-sm font-bold">
                      🧩 {r._count.puzzles} {r._count.puzzles === 1 ? "puzzle" : "puzzles"}
                    </span>
                  )}

                  {isActive && (
                    <span className="mt-2 px-6 py-2 rounded-full bg-white/90 text-stone-800 font-bold text-base shadow-md animate-pulse">
                      Tap to play!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      {residents.length > 1 && (
        <div className="flex gap-2 mt-6 z-10">
          {residents.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-8 h-3 bg-stone-800"
                  : "w-3 h-3 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>
      )}

      {/* Arrow buttons for non-touch */}
      {residents.length > 1 && (
        <>
          <button
            onClick={() => goTo(activeIndex - 1)}
            className={`fixed left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/80 shadow-lg flex items-center justify-center text-2xl text-stone-600 hover:bg-white transition z-20 ${
              activeIndex === 0 ? "opacity-30 pointer-events-none" : ""
            }`}
          >
            ‹
          </button>
          <button
            onClick={() => goTo(activeIndex + 1)}
            className={`fixed right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/80 shadow-lg flex items-center justify-center text-2xl text-stone-600 hover:bg-white transition z-20 ${
              activeIndex === residents.length - 1 ? "opacity-30 pointer-events-none" : ""
            }`}
          >
            ›
          </button>
        </>
      )}

      <p className="fixed bottom-4 text-xs text-stone-400/60 z-10">puzzleme.app</p>
    </main>
  );
}
