import { create } from "zustand";
import type { PuzzlePiece } from "@/lib/puzzle-engine";

interface PuzzleState {
  pieces: PuzzlePiece[];
  activePieceId: number | null;
  dragOffset: { x: number; y: number };
  isComplete: boolean;
  gridSize: number;
  imageUrl: string | null;

  setPieces: (pieces: PuzzlePiece[]) => void;
  setActivePiece: (id: number | null, offset?: { x: number; y: number }) => void;
  movePiece: (id: number, x: number, y: number) => void;
  placePiece: (id: number, x: number, y: number) => void;
  setComplete: (complete: boolean) => void;
  setGridSize: (size: number) => void;
  setImageUrl: (url: string) => void;
  reset: () => void;
}

export const usePuzzle = create<PuzzleState>((set) => ({
  pieces: [],
  activePieceId: null,
  dragOffset: { x: 0, y: 0 },
  isComplete: false,
  gridSize: 3,
  imageUrl: null,

  setPieces: (pieces) => set({ pieces }),
  setActivePiece: (id, offset) =>
    set({ activePieceId: id, dragOffset: offset || { x: 0, y: 0 } }),
  movePiece: (id, x, y) =>
    set((state) => ({
      pieces: state.pieces.map((p) =>
        p.id === id ? { ...p, currentX: x, currentY: y } : p
      ),
    })),
  placePiece: (id, x, y) =>
    set((state) => ({
      pieces: state.pieces.map((p) =>
        p.id === id ? { ...p, currentX: x, currentY: y, isPlaced: true } : p
      ),
    })),
  setComplete: (complete) => set({ isComplete: complete }),
  setGridSize: (size) => set({ gridSize: size }),
  setImageUrl: (url) => set({ imageUrl: url }),
  reset: () =>
    set({
      pieces: [],
      activePieceId: null,
      dragOffset: { x: 0, y: 0 },
      isComplete: false,
    }),
}));
