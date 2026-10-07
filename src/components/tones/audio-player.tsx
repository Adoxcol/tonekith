"use client";

export function AudioPlayer({
  src,
  toneId,
  fileName,
}: {
  src: string;
  toneId: string;
  fileName: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{fileName}</p>
      <audio
        controls
        preload="none"
        className="w-full"
        onPlay={() => {
          void fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventType: "audio_played", toneId }),
          });
        }}
      >
        <source src={src} />
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}
