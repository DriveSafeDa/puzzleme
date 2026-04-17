"use client";

export function HintToggle({
  showHint,
  onToggle,
}: {
  showHint: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        showHint
          ? "bg-stone-900 text-white"
          : "bg-cream-200 text-stone-500 hover:bg-cream-300"
      }`}
    >
      {showHint ? "Hide Hint" : "Show Hint"}
    </button>
  );
}
