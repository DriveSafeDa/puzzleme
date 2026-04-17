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

const SNAP_RADIUS = 80;

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
  const piecesRef = useRef<PuzzlePiece[]>([]);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const activePieceRef = useRef<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [boardSize, setBoardSize] = useState({ w: 0, h: 0 });
  const [, forceRender] = useState(0);
  const startTime = useRef(Date.now());

  // Keep ref in sync
  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

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

  // Find which piece is under a point
  const findPieceAt = useCallback((boardX: number, boardY: number): number | null => {
    // Search from top (last in array = highest z-index) to bottom
    // Use generous padding so partially offscreen pieces are still grabbable
    const pad = 20;
    for (let i = piecesRef.current.length - 1; i >= 0; i--) {
      const p = piecesRef.current[i];
      if (p.isPlaced) continue;
      if (
        boardX >= p.currentX - pad &&
        boardX <= p.currentX + p.canvasW + pad &&
        boardY >= p.currentY - pad &&
        boardY <= p.currentY + p.canvasH + pad
      ) {
        return p.id;
      }
    }
    return null;
  }, []);

  const snapAndCheck = useCallback((pieceId: number) => {
    setPieces((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== pieceId) return p;
        const snap = checkSnap(p, SNAP_RADIUS);
        if (snap.snapped) {
          playSnap();
          vibrate();
          return { ...p, currentX: snap.x, currentY: snap.y, isPlaced: true };
        }
        return p;
      });

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
  }, [gridSize, puzzleId]);

  // All pointer events on the board — prevents losing capture
  const handleBoardPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const board = boardRef.current?.getBoundingClientRect();
      if (!board) return;

      const boardX = e.clientX - board.left;
      const boardY = e.clientY - board.top;
      const pieceId = findPieceAt(boardX, boardY);
      if (pieceId === null) return;

      const piece = piecesRef.current.find((p) => p.id === pieceId);
      if (!piece) return;

      activePieceRef.current = pieceId;
      dragOffsetRef.current = {
        x: boardX - piece.currentX,
        y: boardY - piece.currentY,
      };
      playPickUp();

      // Bring to front
      setPieces((prev) => {
        const idx = prev.findIndex((p) => p.id === pieceId);
        const copy = [...prev];
        const [moved] = copy.splice(idx, 1);
        copy.push(moved);
        return copy;
      });

      boardRef.current?.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [findPieceAt]
  );

  const handleBoardPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pieceId = activePieceRef.current;
      if (pieceId === null) return;

      const board = boardRef.current?.getBoundingClientRect();
      if (!board) return;

      const piece = piecesRef.current.find((p) => p.id === pieceId);
      if (!piece) return;

      // Clamp to board bounds
      const rawX = e.clientX - board.left - dragOffsetRef.current.x;
      const rawY = e.clientY - board.top - dragOffsetRef.current.y;
      const x = Math.max(-piece.canvasW * 0.3, Math.min(board.width - piece.canvasW * 0.7, rawX));
      const y = Math.max(-piece.canvasH * 0.3, Math.min(board.height - piece.canvasH * 0.7, rawY));

      // Update piece position
      setPieces((prev) =>
        prev.map((p) =>
          p.id === pieceId ? { ...p, currentX: x, currentY: y } : p
        )
      );

      // Magnetic snap — check while dragging
      const piece = piecesRef.current.find((p) => p.id === pieceId);
      if (piece) {
        const testPiece = { ...piece, currentX: x, currentY: y };
        const snap = checkSnap(testPiece, SNAP_RADIUS);
        if (snap.snapped) {
          activePieceRef.current = null;
          snapAndCheck(pieceId);
          forceRender((n) => n + 1);
        }
      }
    },
    [snapAndCheck]
  );

  const handleBoardPointerUp = useCallback(() => {
    const pieceId = activePieceRef.current;
    if (pieceId === null) return;

    // Try snap on release too (in case magnetic didn't trigger)
    snapAndCheck(pieceId);
    activePieceRef.current = null;
    forceRender((n) => n + 1);
  }, [snapAndCheck]);

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

  const activePieceId = activePieceRef.current;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-4 select-none">
      <div className="flex items-center gap-4 mb-4">
        <HintToggle showHint={showHint} onToggle={() => setShowHint(!showHint)} />
        <span className="text-sm text-stone-400">
          {pieces.filter((p) => p.isPlaced).length} / {pieces.length} placed
        </span>
      </div>

      {/* Hint reference card */}
      {showHint && (
        <div className="mb-4 rounded-xl overflow-hidden border-2 border-cream-300 shadow-md" style={{ maxWidth: 240 }}>
          <img
            src={imageUrl}
            alt="Hint — completed puzzle"
            className="w-full object-contain"
          />
        </div>
      )}

      <div
        ref={boardRef}
        className="relative rounded-2xl border-2 border-cream-300 bg-cream-100 touch-none"
        style={{ width: boardSize.w, height: boardSize.h }}
        onPointerDown={handleBoardPointerDown}
        onPointerMove={handleBoardPointerMove}
        onPointerUp={handleBoardPointerUp}
        onPointerCancel={handleBoardPointerUp}
      >
        {/* Puzzle pieces */}
        {pieces.map((piece, zIndex) => (
          <div
            key={piece.id}
            className={`absolute ${
              piece.isPlaced
                ? "cursor-default"
                : activePieceId === piece.id
                ? "cursor-grabbing scale-105"
                : "cursor-grab"
            }`}
            style={{
              left: piece.currentX,
              top: piece.currentY,
              width: piece.canvasW,
              height: piece.canvasH,
              zIndex: piece.isPlaced ? 0 : zIndex + 1,
              transition: piece.isPlaced ? "all 0.15s ease-out" : "none",
              filter:
                activePieceId === piece.id
                  ? "drop-shadow(4px 4px 8px rgba(0,0,0,0.35))"
                  : piece.isPlaced
                  ? "none"
                  : "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))",
              pointerEvents: "none",
            }}
          >
            <img
              src={piece.dataUrl}
              alt=""
              draggable={false}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
