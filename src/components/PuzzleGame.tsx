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
        const shuffled = shufflePieces(sliced, boardSize.w, boardSize.h);
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
        className="relative rounded-2xl border-2 border-cream-300 bg-cream-100 touch-none"
        style={{ width: boardSize.w, height: boardSize.h }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Ghost hint image */}
        {showHint && (
          <img
            src={imageUrl}
            alt=""
            className="absolute opacity-15 pointer-events-none object-contain"
            style={{
              left: pieces[0]?.correctX + (pieces[0]?.canvasW - Math.floor(boardSize.w / gridSize)) / 2,
              top: pieces[0]?.correctY + (pieces[0]?.canvasH - Math.floor(boardSize.h / gridSize)) / 2,
              width: Math.floor(boardSize.w / gridSize) * gridSize,
              height: Math.floor(boardSize.h / gridSize) * gridSize,
            }}
          />
        )}

        {/* Puzzle pieces */}
        {pieces.map((piece, zIndex) => (
          <div
            key={piece.id}
            onPointerDown={(e) => handlePointerDown(e, piece.id)}
            className={`absolute cursor-grab active:cursor-grabbing ${
              piece.isPlaced
                ? "cursor-default"
                : activePiece === piece.id
                ? "scale-105 z-50"
                : ""
            }`}
            style={{
              left: piece.currentX,
              top: piece.currentY,
              width: piece.canvasW,
              height: piece.canvasH,
              zIndex: piece.isPlaced ? 0 : zIndex + 1,
              transition:
                activePiece === piece.id
                  ? "none"
                  : piece.isPlaced
                  ? "all 0.2s ease"
                  : "none",
              filter:
                activePiece === piece.id
                  ? "drop-shadow(4px 4px 8px rgba(0,0,0,0.3))"
                  : piece.isPlaced
                  ? "none"
                  : "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))",
            }}
          >
            <img
              src={piece.dataUrl}
              alt=""
              draggable={false}
              className="w-full h-full pointer-events-none"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
