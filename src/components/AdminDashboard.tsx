"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Resident {
  id: string;
  displayName: string;
  photoUrl: string | null;
  uploadCode: string;
  puzzleCount: number;
  createdAt: string;
}

export function AdminDashboard({ residents }: { residents: Resident[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);

    try {
      const res = await fetch("/api/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name.trim() }),
      });

      if (res.ok) {
        setName("");
        router.refresh();
      }
    } catch {
      // ignore
    }
    setAdding(false);
  }

  function copyLink(code: string, type: "upload" | "play") {
    const url = `${window.location.origin}/${type}/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(`${type}-${code}`);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function handleDelete(id: string, displayName: string) {
    if (!confirm(`Remove ${displayName}? This will delete all their puzzles too.`)) return;

    await fetch(`/api/residents/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <main className="min-h-screen px-4 py-8 bg-cream-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-stone-900">
          PuzzleMe Admin 🧩
        </h1>
        <p className="mt-1 text-stone-500 text-sm">
          Add residents and share upload links with their families.
        </p>

        {/* Add resident form */}
        <form onSubmit={handleAdd} className="mt-6 flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Resident's first name"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-cream-300 bg-white text-stone-800 text-sm font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={!name.trim() || adding}
            className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </form>

        {/* Resident list */}
        <div className="mt-8 space-y-3">
          {residents.length === 0 && (
            <p className="text-stone-400 text-center py-8">
              No residents yet. Add one above!
            </p>
          )}

          {residents.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border-2 border-cream-300 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {r.photoUrl ? (
                    <img
                      src={r.photoUrl}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-xl font-bold text-amber-600">
                        {r.displayName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">
                      {r.displayName}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Code: <span className="font-mono font-bold text-stone-600">{r.uploadCode}</span>
                      {" · "}
                      {r.puzzleCount} {r.puzzleCount === 1 ? "puzzle" : "puzzles"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(r.id, r.displayName)}
                  className="text-xs text-stone-300 hover:text-red-400 transition"
                >
                  Remove
                </button>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => copyLink(r.uploadCode, "upload")}
                  className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition active:scale-95"
                >
                  {copied === `upload-${r.uploadCode}`
                    ? "✓ Copied!"
                    : "📋 Copy Upload Link"}
                </button>
                <button
                  onClick={() => copyLink(r.uploadCode, "play")}
                  className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition active:scale-95"
                >
                  {copied === `play-${r.uploadCode}`
                    ? "✓ Copied!"
                    : "🧩 Copy Play Link"}
                </button>
                <a
                  href={`/upload/${r.uploadCode}`}
                  className="px-4 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold hover:bg-sky-100 transition"
                >
                  📸 Open Upload Page
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-stone-400">puzzleme.app/admin</p>
      </div>
    </main>
  );
}
