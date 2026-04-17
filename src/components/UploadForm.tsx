"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function UploadForm({ code }: { code: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!preview) return;

    setStatus("uploading");

    try {
      // Upload image as base64 to our API which will store it
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          imageData: preview,
          caption: caption.trim() || null,
          uploadedBy: uploadedBy.trim() || null,
        }),
      });

      if (res.ok) {
        setStatus("done");
        setPreview(null);
        setCaption("");
        setUploadedBy("");
        if (fileRef.current) fileRef.current.value = "";
        // Refresh to show new puzzle in list
        router.refresh();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo picker */}
      <div
        onClick={() => fileRef.current?.click()}
        className="relative rounded-2xl border-3 border-dashed border-cream-400 bg-white/60 hover:bg-white/80 transition cursor-pointer overflow-hidden"
        style={{ minHeight: 200 }}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full object-contain max-h-80" />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <span className="text-5xl mb-3">📷</span>
            <p className="text-stone-600 font-bold text-base">Tap to choose a photo</p>
            <p className="text-stone-400 text-sm mt-1">Pick a family memory</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {preview && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            if (fileRef.current) fileRef.current.value = "";
          }}
          className="text-sm text-stone-400 hover:text-stone-600 transition"
        >
          ✕ Remove photo
        </button>
      )}

      {/* Caption */}
      <div>
        <label className="block text-sm font-bold text-stone-700 mb-1">
          Write a caption 💬
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Remember when we went to the beach, Mom?"
          rows={2}
          className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 bg-white text-stone-800 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
        />
      </div>

      {/* Your name */}
      <div>
        <label className="block text-sm font-bold text-stone-700 mb-1">
          Your name 👋
        </label>
        <input
          type="text"
          value={uploadedBy}
          onChange={(e) => setUploadedBy(e.target.value)}
          placeholder="Sarah"
          className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 bg-white text-stone-800 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!preview || status === "uploading"}
        className="w-full py-4 rounded-2xl font-extrabold text-white text-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: preview ? "linear-gradient(135deg, #F59E0B, #EF4444)" : "#D4D0C8" }}
      >
        {status === "uploading" ? "Uploading..." : "Add This Memory 🧩"}
      </button>

      {status === "done" && (
        <div className="text-center py-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-emerald-700 font-bold text-sm">Memory uploaded! 🎉</p>
          <p className="text-emerald-600 text-xs mt-1">It&apos;s ready to puzzle.</p>
        </div>
      )}

      {status === "error" && (
        <p className="text-red-500 text-sm text-center">Something went wrong — try again.</p>
      )}
    </form>
  );
}
