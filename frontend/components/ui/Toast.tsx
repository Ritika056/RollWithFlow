"use client";

export function Toast({ message, tone = "success" }: { message: string | null; tone?: "success" | "error" }) {
  if (!message) return null;
  return (
    <div className={`fixed bottom-5 right-5 z-50 rounded-2xl border px-4 py-3 text-sm shadow-panel backdrop-blur-xl ${
      tone === "success" ? "border-signal/30 bg-signal/15 text-signal" : "border-cue/30 bg-cue/15 text-cue"
    }`}>
      {message}
    </div>
  );
}
