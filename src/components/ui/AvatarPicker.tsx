"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";

const PRESETS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Riley",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
  "https://api.dicebear.com/7.x/personas/svg?seed=Morgan",
  "https://api.dicebear.com/7.x/personas/svg?seed=River",
  "https://api.dicebear.com/7.x/personas/svg?seed=Sage",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Quinn",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Avery",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Robin",
];

type Props = {
  open: boolean;
  current: string;
  onClose: () => void;
  onSelect: (url: string) => void;
};

export default function AvatarPicker({
  open,
  current,
  onClose,
  onSelect,
}: Props) {
  const [draft, setDraft] = useState<string>(current);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(current);
      setUrlInput("");
      setError(null);
    }
  }, [open, current]);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 2_500_000) {
      setError("Image is too large (max 2.5 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setDraft(result);
        setError(null);
      }
    };
    reader.onerror = () => setError("Could not read that image.");
    reader.readAsDataURL(file);
  }

  function applyUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setDraft(trimmed);
    setUrlInput("");
    setError(null);
  }

  function save() {
    if (!draft) return;
    onSelect(draft);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change avatar"
      description="Pick a preset, paste an image URL, or upload from your device."
      icon="account_circle"
      footer={
        <>
          <button
            onClick={onClose}
            className="text-sm font-bold uppercase tracking-widest text-on-surface-variant px-3 py-2"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!draft || draft === current}
            className="rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">check</span>
            Save
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl overflow-hidden ring-2 ring-white/60 shrink-0 bg-white/70">
            {draft ? (
              <img
                src={draft}
                alt="Selected avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">person</span>
              </div>
            )}
          </div>
          <div className="text-sm">
            <p className="font-bold text-on-surface">Preview</p>
            <p className="text-on-surface-variant text-[12px] mt-0.5">
              This is what people on your care team will see.
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">
            Presets
          </p>
          <div className="grid grid-cols-6 gap-2.5">
            {PRESETS.map((url) => {
              const selected = draft === url;
              return (
                <button
                  key={url}
                  onClick={() => setDraft(url)}
                  aria-label="Choose avatar"
                  aria-pressed={selected}
                  className={`relative aspect-square rounded-2xl overflow-hidden ring-2 transition-all active:scale-95 ${
                    selected
                      ? "ring-primary shadow-glow-teal"
                      : "ring-white/60 hover:ring-primary/40"
                  }`}
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover bg-white"
                  />
                  {selected && (
                    <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">
                        check
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">
            Image URL
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="flex-1 rounded-xl border border-white/60 bg-white/80 px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
            <button
              onClick={applyUrl}
              disabled={!urlInput.trim()}
              className="rounded-xl bg-white/70 hover:bg-white text-primary px-4 py-2.5 text-sm font-bold disabled:opacity-50 transition-colors"
            >
              Use
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">
            Upload
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl border border-dashed border-primary/40 bg-white/40 hover:bg-white/70 px-4 py-3 text-sm font-bold text-primary flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-base">
              photo_camera
            </span>
            Choose image from device
          </button>
        </div>

        {error && (
          <p className="text-[12px] font-semibold text-error">{error}</p>
        )}
      </div>
    </Modal>
  );
}
