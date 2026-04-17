import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/UploadForm";

export const dynamic = "force-dynamic";

export default async function UploadPage({
  params,
}: {
  params: { code: string };
}) {
  const resident = await prisma.resident.findUnique({
    where: { uploadCode: params.code },
    include: {
      puzzles: {
        orderBy: { createdAt: "desc" },
        select: { id: true, imageUrl: true, caption: true, uploadedBy: true, createdAt: true },
      },
    },
  });

  if (!resident) redirect("/");

  return (
    <main className="min-h-screen px-4 py-8"
      style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 50%, #ECFDF5 100%)" }}
    >
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-stone-900">
            Upload a Memory 📸
          </h1>
          <p className="mt-2 text-stone-500">
            for <span className="font-bold text-stone-700">{resident.displayName}</span>
          </p>
        </div>

        <UploadForm code={params.code} />

        {/* Existing puzzles */}
        {resident.puzzles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-stone-800 mb-4">
              {resident.displayName}&apos;s Memories ({resident.puzzles.length})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {resident.puzzles.map((p) => (
                <div key={p.id} className="rounded-xl overflow-hidden bg-white shadow-sm border border-cream-300">
                  <img src={p.imageUrl} alt="" className="w-full aspect-[4/3] object-cover" />
                  <div className="p-3">
                    {p.caption && (
                      <p className="text-xs text-stone-600 line-clamp-2">&ldquo;{p.caption}&rdquo;</p>
                    )}
                    {p.uploadedBy && (
                      <p className="text-xs text-stone-400 mt-1">— {p.uploadedBy}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-12 text-center text-xs text-stone-400">puzzleme.app</p>
      </div>
    </main>
  );
}
