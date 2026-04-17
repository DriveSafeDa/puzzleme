"use client";

const levels = [
  { grid: 2, label: "Easy", pieces: "4 pieces", emoji: "😊" },
  { grid: 3, label: "Medium", pieces: "9 pieces", emoji: "🧩" },
  { grid: 4, label: "Challenge", pieces: "16 pieces", emoji: "💪" },
];

export function DifficultyPicker({
  onSelect,
  onBack,
}: {
  onSelect: (gridSize: number) => void;
  onBack: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <h2 className="text-2xl md:text-3xl font-bold text-stone-900 text-center">
        How many pieces?
      </h2>
      <p className="mt-2 text-stone-500">Pick your challenge.</p>

      <div className="mt-10 flex flex-col gap-4 w-full max-w-sm">
        {levels.map((level) => (
          <button
            key={level.grid}
            onClick={() => onSelect(level.grid)}
            className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-white border-2 border-cream-300 hover:border-stone-400 transition-all hover:shadow-lg active:scale-[0.97] text-left"
          >
            <span className="text-3xl">{level.emoji}</span>
            <div>
              <span className="text-lg font-bold text-stone-900">
                {level.label}
              </span>
              <span className="block text-sm text-stone-400">
                {level.pieces}
              </span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="mt-8 px-6 py-2 rounded-xl text-sm text-stone-400 hover:bg-cream-200 transition"
      >
        ← Pick a different puzzle
      </button>
    </main>
  );
}
