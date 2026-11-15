"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
  value: string;          // current URL (empty = no image)
  onChange: (url: string) => void;
  label?: string;
};

export function ImageUpload({ value, onChange, label = "Photo" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("Upload failed — check your connection.");
    }
    setUploading(false);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium" style={{ color: "#78716C" }}>{label}</p>

      {value ? (
        // Preview
        <div className="group relative overflow-hidden rounded-xl" style={{ height: "160px" }}>
          <Image
            src={value}
            alt="Dish photo"
            fill
            className="object-cover"
            sizes="400px"
          />
          {/* Overlay actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <ImagePlus size={14} />
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold backdrop-blur-sm"
              style={{ background: "rgba(220,38,38,0.8)", color: "white" }}
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        // Drop zone
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors hover:bg-stone-50 disabled:opacity-60"
          style={{ borderColor: "#D6CEC7", height: "120px" }}
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin" style={{ color: "#A8A29E" }} />
          ) : (
            <>
              <ImagePlus size={22} strokeWidth={1.5} style={{ color: "#A8A29E" }} />
              <span className="text-xs" style={{ color: "#A8A29E" }}>
                Click or drag a photo here
              </span>
              <span className="text-xs" style={{ color: "#D6CEC7" }}>
                JPEG · PNG · WebP · max 8 MB
              </span>
            </>
          )}
        </button>
      )}

      {uploading && value === "" && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: "#78716C" }}>
          <Loader2 size={12} className="animate-spin" /> Uploading…
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: "#DC2626" }}>{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
