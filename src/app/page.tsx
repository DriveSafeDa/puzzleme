export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">
          PuzzleMe
        </h1>
        <p className="mt-4 text-lg text-stone-500 leading-relaxed">
          Piece your memories together.
        </p>
        <p className="mt-6 text-sm text-stone-400 leading-relaxed max-w-sm mx-auto">
          Family uploads a photo of a shared memory. Your loved one assembles
          the puzzle — and rebuilds the moment, piece by piece.
        </p>
      </div>
      <p className="absolute bottom-6 text-[10px] text-stone-300">
        puzzleme.app
      </p>
    </main>
  );
}
