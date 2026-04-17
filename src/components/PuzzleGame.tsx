"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  sliceImage,
  shufflePieces,
  checkSnap,
  isComplete,
  type PuzzlePiece,
} from "@/lib/puzzle-engine";
import { playSnap, playCelebrate, playPickUp, vibrate } from "@/lib/sounds";
import { CelebrationOverlay } from "./CelebrationOverlay";
import { HintToggle } from "./HintToggle";

export function PuzzleGame({
  puzzleId,
  imageUrl,
  caption,
  uploadedBy,
  residentName,
  gridSize,
  code,
}: {
  puzzleId: string;
  imageUrl: string;
  caption: string | null;
  uploadedBy: string | null;
  residentName: string;
  gridSize: number;
  code: string;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [activePiece, setActivePiece] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [boardSize, setBoardSize] = useState({ w: 0, h: 0 });
  const startTime = useRef(Date.now());

  // Calculate board size
  useEffect(() => {
    function updateSize() {
      const w = Math.min(window.innerWidth - 32, 800);
      const h = Math.min(window.innerHeight - 160, 700);
      setBoardSize({ w, h });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Slice and shuffle on load
  useEffect(() => {
    if (boardSize.w === 0 || boardSize.h === 0) return;

    sliceImage(imageUrl, gridSize, boardSize.w, boardSize.h).then(
      (sliced) => {
        const pieceW = Math.floor(boardSize.w / gridSize);
        const pieceH = Math.floor(boardSize.h / gridSize);
        const shuffled = shufflePieces(
          sliced,
          boardSize.w,
          boardSize.h,
          pieceW,
          pieceH
        );
        setPieces(shuffled);
        setLoading(false);
        startTime.current = Date.now();
      }
    );
  }, [imageUrl, gridSize, boardSize]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, pieceId: number) => {
      const piece = pieces.find((p) => p.id === pieceId);
      if (!piece || piece.isPlaced) return;

      const board = boardRef.current?.getBoundingClientRect();
      if (!board) return;

      setActivePiece(pieceId);
      setDragOffset({
        x: e.clientX - board.left - piece.currentX,
        y: e.clientY - board.top - piece.currentY,
      });
      playPickUp();

      // Bring to front by moving to end of array
      setPieces((prev) => {
        const idx = prev.findIndex((p) => p.id === pieceId);
        const copy = [...prev];
        const [moved] = copy.splice(idx, 1);
        copy.push(moved);
        return copy;
      });

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pieces]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (activePiece === null) return;
      const board = boardRef.current?.getBoundingClientRect();
      if (!board) return;

      const x = e.clientX - board.left - dragOffset.x;
      const y = e.clientY - board.top - dragOffset.y;

      setPieces((prev) =>
        prev.map((p) =>
          p.id === activePiece ? { ...p, currentX: x, currentY: y } : p
        )
      );
    },
    [activePiece, dragOffset]
  );

  const handlePointerUp = useCallback(() => {
    if (activePiece === null) return;

    setPieces((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== activePiece) return p;
        const snap = checkSnap(p, 40);
        if (snap.snapped) {
          playSnap();
          vibrate();
          return { ...p, currentX: snap.x, currentY: snap.y, isPlaced: true };
        }
        return p;
      });

      // Check completion
      if (isComplete(updated)) {
        setTimeout(() => {
          playCelebrate();
          setCompleted(true);

          // Log session
          const duration = Math.round((Date.now() - startTime.current) / 1000);
          fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              puzzleId,
              difficulty: gridSize,
              completed: true,
              durationSecs: duration,
            }),
          }).catch(() => {});
        }, 300);
      }

      return updated;
    });

    setActivePiece(null);
  }, [activePiece, gridSize, puzzleId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-stone-400 text-lg animate-pulse">
          Getting your puzzle ready...
        </p>
      </main>
    );
  }

  if (completed) {
    return (
      <CelebrationOverlay
        imageUrl={imageUrl}
        caption={caption}
        uploadedBy={uploadedBy}
        residentName={residentName}
        code={code}
        puzzleId={puzzleId}
        gridSize={gridSize}
      />
    );
  }

  const pieceW = Math.floor(boardSize.w / gridSize);
  const pieceH = Math.floor(boardSize.h / gridSize);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-4 select-none">
      <div className="flex items-center gap-4 mb-4">
        <HintToggle showHint={showHint} onToggle={() => setShowHint(!showHint)} />
        <span className="text-sm text-stone-400">
          {pieces.filter((p) => p.isPlaced).length} / {pieces.length} placed
        </span>
      </div>

      <div
        ref={boardRef}
        className="relative rounded-2xl border-2 border-cream-300 bg-cream-100 overflow-hidden touch-none"
        style={{ width: boardSize.w, height: boardSize.h }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Ghost hint image */}
        {showHint && (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-contain opacity-15 pointer-events-none"
          />
        )}

        {/* Grid lines */}
        {Array.from({ length: gridSize - 1 }).map((_, i) => (
          <div key={`v${i}`}>
            <div
              className="absolute top-0 bottom-0 border-l border-dashed border-cream-400"
              style={{ left: pieces[0]?.correctX + pieceW * (i + 1) }}
            />
            <div
              className="absolute left-0 right-0 border-t border-dashed border-cream-400"
              style={{ top: pieces[0]?.correctY + pieceH * (i + 1) }}
            />
          </div>
        ))}

        {/* Puzzle pieces */}
        {pieces.map((piece, zIndex) => (
          <div
            key={piece.id}
            onPointerDown={(e) => handlePointerDown(e, piece.id)}
            className={`absolute cursor-grab active:cursor-grabbing transition-shadow ${
              piece.isPlaced
                ? "ring-2 ring-puzzle-snap/50 cursor-default"
                : activePiece === piece.id
                ? "scale-105 shadow-xl z-50"
                : "shadow-md hover:shadow-lg"
            }`}
            style={{
              left: piece.currentX,
              top: piece.currentY,
              width: pieceW,
              height: pieceH,
              zIndex: piece.isPlaced ? 0 : zIndex + 1,
              transition:
                activePiece === piece.id
                  ? "none"
                  : piece.isPlaced
                  ? "all 0.2s ease"
                  : "shadow 0.15s",
            }}
          >
            <img
              src={piece.dataUrl}
              alt=""
              draggable={false}
              className="w-full h-full rounded-sm border-2 border-white pointer-events-none"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
