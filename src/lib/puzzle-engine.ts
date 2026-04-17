export interface PuzzlePiece {
  id: number;
  row: number;
  col: number;
  dataUrl: string;
  currentX: number;
  currentY: number;
  correctX: number;
  correctY: number;
  isPlaced: boolean;
}

/**
 * Load an image URL onto an offscreen canvas, scaled to fit maxSize.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

/**
 * Slice an image into a grid of pieces.
 * Returns piece data with correct positions and data URLs.
 */
export async function sliceImage(
  imageUrl: string,
  gridSize: number,
  boardWidth: number,
  boardHeight: number
): Promise<PuzzlePiece[]> {
  const img = await loadImage(imageUrl);

  // Scale image to fit board while maintaining aspect ratio
  const scale = Math.min(boardWidth / img.width, boardHeight / img.height);
  const scaledW = Math.round(img.width * scale);
  const scaledH = Math.round(img.height * scale);

  const pieceW = Math.floor(scaledW / gridSize);
  const pieceH = Math.floor(scaledH / gridSize);

  // Offset to center the puzzle on the board
  const offsetX = Math.floor((boardWidth - pieceW * gridSize) / 2);
  const offsetY = Math.floor((boardHeight - pieceH * gridSize) / 2);

  const pieces: PuzzlePiece[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const canvas = document.createElement("canvas");
      canvas.width = pieceW;
      canvas.height = pieceH;
      const ctx = canvas.getContext("2d")!;

      // Source rectangle from the original image
      const sx = (col * img.width) / gridSize;
      const sy = (row * img.height) / gridSize;
      const sw = img.width / gridSize;
      const sh = img.height / gridSize;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, pieceW, pieceH);

      pieces.push({
        id: row * gridSize + col,
        row,
        col,
        dataUrl: canvas.toDataURL("image/webp", 0.9),
        currentX: 0,
        currentY: 0,
        correctX: offsetX + col * pieceW,
        correctY: offsetY + row * pieceH,
        isPlaced: false,
      });
    }
  }

  return pieces;
}

/**
 * Shuffle pieces randomly within the board area.
 * Ensures no piece starts at its correct position.
 */
export function shufflePieces(
  pieces: PuzzlePiece[],
  boardWidth: number,
  boardHeight: number,
  pieceW: number,
  pieceH: number
): PuzzlePiece[] {
  return pieces.map((piece) => {
    let x: number, y: number;
    do {
      x = Math.floor(Math.random() * (boardWidth - pieceW));
      y = Math.floor(Math.random() * (boardHeight - pieceH));
    } while (
      Math.abs(x - piece.correctX) < 50 &&
      Math.abs(y - piece.correctY) < 50
    );

    return { ...piece, currentX: x, currentY: y };
  });
}

/**
 * Check if a piece is close enough to snap into its correct position.
 */
export function checkSnap(
  piece: PuzzlePiece,
  snapRadius: number = 40
): { snapped: boolean; x: number; y: number } {
  const dx = Math.abs(piece.currentX - piece.correctX);
  const dy = Math.abs(piece.currentY - piece.correctY);

  if (dx < snapRadius && dy < snapRadius) {
    return { snapped: true, x: piece.correctX, y: piece.correctY };
  }
  return { snapped: false, x: piece.currentX, y: piece.currentY };
}

/**
 * Check if all pieces are placed correctly.
 */
export function isComplete(pieces: PuzzlePiece[]): boolean {
  return pieces.every((p) => p.isPlaced);
}
