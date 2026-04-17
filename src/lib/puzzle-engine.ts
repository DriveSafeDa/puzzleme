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
  // Piece canvas dimensions (larger than cell to include tabs)
  canvasW: number;
  canvasH: number;
}

/** Edge types: 0 = flat (border), 1 = tab (outward), -1 = blank (inward) */
type Edge = 0 | 1 | -1;

interface PieceEdges {
  top: Edge;
  right: Edge;
  bottom: Edge;
  left: Edge;
}

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
 * Generate edge map for all pieces.
 * Adjacent pieces must have opposite edges (tab meets blank).
 */
function generateEdges(gridSize: number): PieceEdges[][] {
  const edges: PieceEdges[][] = [];

  for (let row = 0; row < gridSize; row++) {
    edges[row] = [];
    for (let col = 0; col < gridSize; col++) {
      edges[row][col] = {
        top: row === 0 ? 0 : (-edges[row - 1][col].bottom as Edge),
        left: col === 0 ? 0 : (-edges[row][col - 1].right as Edge),
        bottom: row === gridSize - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1) as Edge,
        right: col === gridSize - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1) as Edge,
      };
    }
  }

  return edges;
}

/**
 * Draw a jigsaw piece path on a canvas context.
 * The path is drawn relative to the piece's cell within the canvas,
 * accounting for the tab overflow margin.
 */
function drawPiecePath(
  ctx: CanvasRenderingContext2D,
  edges: PieceEdges,
  cellW: number,
  cellH: number,
  tabSize: number,
  margin: number
) {
  const x = margin;
  const y = margin;

  ctx.beginPath();
  ctx.moveTo(x, y);

  // Top edge
  if (edges.top === 0) {
    ctx.lineTo(x + cellW, y);
  } else {
    const dir = edges.top; // 1 = tab (up), -1 = blank (down)
    ctx.lineTo(x + cellW * 0.35, y);
    ctx.bezierCurveTo(
      x + cellW * 0.35, y - dir * tabSize * 0.2,
      x + cellW * 0.3, y - dir * tabSize,
      x + cellW * 0.5, y - dir * tabSize
    );
    ctx.bezierCurveTo(
      x + cellW * 0.7, y - dir * tabSize,
      x + cellW * 0.65, y - dir * tabSize * 0.2,
      x + cellW * 0.65, y
    );
    ctx.lineTo(x + cellW, y);
  }

  // Right edge
  if (edges.right === 0) {
    ctx.lineTo(x + cellW, y + cellH);
  } else {
    const dir = edges.right;
    ctx.lineTo(x + cellW, y + cellH * 0.35);
    ctx.bezierCurveTo(
      x + cellW + dir * tabSize * 0.2, y + cellH * 0.35,
      x + cellW + dir * tabSize, y + cellH * 0.3,
      x + cellW + dir * tabSize, y + cellH * 0.5
    );
    ctx.bezierCurveTo(
      x + cellW + dir * tabSize, y + cellH * 0.7,
      x + cellW + dir * tabSize * 0.2, y + cellH * 0.65,
      x + cellW, y + cellH * 0.65
    );
    ctx.lineTo(x + cellW, y + cellH);
  }

  // Bottom edge (drawn right to left)
  if (edges.bottom === 0) {
    ctx.lineTo(x, y + cellH);
  } else {
    const dir = edges.bottom;
    ctx.lineTo(x + cellW * 0.65, y + cellH);
    ctx.bezierCurveTo(
      x + cellW * 0.65, y + cellH + dir * tabSize * 0.2,
      x + cellW * 0.7, y + cellH + dir * tabSize,
      x + cellW * 0.5, y + cellH + dir * tabSize
    );
    ctx.bezierCurveTo(
      x + cellW * 0.3, y + cellH + dir * tabSize,
      x + cellW * 0.35, y + cellH + dir * tabSize * 0.2,
      x + cellW * 0.35, y + cellH
    );
    ctx.lineTo(x, y + cellH);
  }

  // Left edge (drawn bottom to top)
  if (edges.left === 0) {
    ctx.lineTo(x, y);
  } else {
    const dir = edges.left;
    ctx.lineTo(x, y + cellH * 0.65);
    ctx.bezierCurveTo(
      x - dir * tabSize * 0.2, y + cellH * 0.65,
      x - dir * tabSize, y + cellH * 0.7,
      x - dir * tabSize, y + cellH * 0.5
    );
    ctx.bezierCurveTo(
      x - dir * tabSize, y + cellH * 0.3,
      x - dir * tabSize * 0.2, y + cellH * 0.35,
      x, y + cellH * 0.35
    );
    ctx.lineTo(x, y);
  }

  ctx.closePath();
}

/**
 * Slice an image into jigsaw-shaped pieces.
 */
export async function sliceImage(
  imageUrl: string,
  gridSize: number,
  boardWidth: number,
  boardHeight: number
): Promise<PuzzlePiece[]> {
  const img = await loadImage(imageUrl);

  const scale = Math.min(boardWidth / img.width, boardHeight / img.height);
  const scaledW = Math.round(img.width * scale);
  const scaledH = Math.round(img.height * scale);

  const cellW = Math.floor(scaledW / gridSize);
  const cellH = Math.floor(scaledH / gridSize);
  const tabSize = Math.floor(Math.min(cellW, cellH) * 0.2);
  const margin = tabSize + 2; // extra space for tabs + stroke

  const offsetX = Math.floor((boardWidth - cellW * gridSize) / 2);
  const offsetY = Math.floor((boardHeight - cellH * gridSize) / 2);

  // Draw full scaled image once
  const fullCanvas = document.createElement("canvas");
  fullCanvas.width = scaledW;
  fullCanvas.height = scaledH;
  const fullCtx = fullCanvas.getContext("2d")!;
  fullCtx.drawImage(img, 0, 0, scaledW, scaledH);

  const edgeMap = generateEdges(gridSize);
  const pieces: PuzzlePiece[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const canvasW = cellW + margin * 2;
      const canvasH = cellH + margin * 2;

      const pieceCanvas = document.createElement("canvas");
      pieceCanvas.width = canvasW;
      pieceCanvas.height = canvasH;
      const ctx = pieceCanvas.getContext("2d")!;

      const edges = edgeMap[row][col];

      // Clip to jigsaw shape
      drawPiecePath(ctx, edges, cellW, cellH, tabSize, margin);
      ctx.save();
      ctx.clip();

      // Draw the portion of the image — sample area extends beyond cell
      // boundaries by margin so tabs contain the correct adjacent image data
      const sx = col * cellW - margin;
      const sy = row * cellH - margin;
      // Clamp source coords to avoid sampling outside the image
      const clampSx = Math.max(0, sx);
      const clampSy = Math.max(0, sy);
      const destX = clampSx - sx;
      const destY = clampSy - sy;
      const drawW = Math.min(canvasW - destX, scaledW - clampSx);
      const drawH = Math.min(canvasH - destY, scaledH - clampSy);
      ctx.drawImage(
        fullCanvas,
        clampSx, clampSy,
        drawW, drawH,
        destX, destY,
        drawW, drawH
      );

      ctx.restore();

      // Draw piece outline — thin stroke for shape definition
      drawPiecePath(ctx, edges, cellW, cellH, tabSize, margin);
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      pieces.push({
        id: row * gridSize + col,
        row,
        col,
        dataUrl: pieceCanvas.toDataURL("image/png"),
        currentX: 0,
        currentY: 0,
        // The cell image content starts at (margin, margin) within the canvas.
        // So the canvas must be positioned so that offset (margin) lines up
        // with the cell's top-left corner on the board.
        correctX: offsetX + col * cellW - margin,
        correctY: offsetY + row * cellH - margin,
        isPlaced: false,
        canvasW,
        canvasH,
      });
    }
  }

  return pieces;
}

/**
 * Shuffle pieces randomly, avoiding correct positions.
 * Spreads pieces across the board without too much overlap.
 */
export function shufflePieces(
  pieces: PuzzlePiece[],
  boardWidth: number,
  boardHeight: number
): PuzzlePiece[] {
  // Create a grid of positions to reduce overlap
  const cols = Math.ceil(Math.sqrt(pieces.length));
  const rows = Math.ceil(pieces.length / cols);
  const slotW = boardWidth / cols;
  const slotH = boardHeight / rows;

  // Shuffle indices
  const indices = pieces.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return pieces.map((piece, i) => {
    const slot = indices[i];
    const slotCol = slot % cols;
    const slotRow = Math.floor(slot / cols);

    // Place within slot with some random jitter
    const jitterX = (Math.random() - 0.5) * slotW * 0.3;
    const jitterY = (Math.random() - 0.5) * slotH * 0.3;
    let x = slotCol * slotW + slotW / 2 - piece.canvasW / 2 + jitterX;
    let y = slotRow * slotH + slotH / 2 - piece.canvasH / 2 + jitterY;

    // Clamp to board
    x = Math.max(0, Math.min(boardWidth - piece.canvasW, x));
    y = Math.max(0, Math.min(boardHeight - piece.canvasH, y));

    // Ensure not starting at correct position
    if (
      Math.abs(x - piece.correctX) < 50 &&
      Math.abs(y - piece.correctY) < 50
    ) {
      x = (x + boardWidth / 3) % (boardWidth - piece.canvasW);
    }

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
