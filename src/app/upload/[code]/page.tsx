import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload a Memory",
};

export default function UploadPage({
  params,
}: {
  params: { code: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-stone-900">Upload a Memory</h1>
        <p className="mt-2 text-sm text-stone-500">
          Add a photo and a caption for your loved one to puzzle together.
        </p>
        <p className="mt-8 text-xs text-stone-400">
          Upload form coming soon — code: {params.code}
        </p>
      </div>
    </main>
  );
}
