"use client";

import { useEffect, useId, useRef, useState } from "react";

type VideoEmbedProps = {
  url: string;
  title: string;
};

type ParsedVideo =
  | { provider: "youtube"; id: string }
  | { provider: "vimeo"; id: string };

type YtPlayer = {
  destroy: () => void;
  getAvailablePlaybackRates: () => number[];
  getCurrentTime: () => number;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setPlaybackRate: (rate: number) => void;
};

const FRAME = 1 / 25;

function parseVideoUrl(raw: string): ParsedVideo | null {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    return id ? { provider: "youtube", id } : null;
  }

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    if (parsed.pathname === "/watch") {
      const id = parsed.searchParams.get("v");
      return id ? { provider: "youtube", id } : null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (
      (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") &&
      parts[1]
    ) {
      return { provider: "youtube", id: parts[1] };
    }
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const parts = parsed.pathname.split("/").filter(Boolean);
    const id = [...parts].reverse().find((part) => /^\d+$/.test(part));
    return id ? { provider: "vimeo", id } : null;
  }

  return null;
}

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };

    if (
      !document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]',
      )
    ) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }
  });
}

function YouTubePlayer({ id, title }: { id: string; title: string }) {
  const mountId = useId().replace(/:/g, "");
  const playerRef = useRef<YtPlayer | null>(null);
  const [rates, setRates] = useState<number[]>([1]);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    let cancelled = false;

    void loadYouTubeApi().then(() => {
      if (cancelled || !window.YT?.Player) {
        return;
      }

      const player = new window.YT.Player(mountId, {
        host: "https://www.youtube-nocookie.com",
        videoId: id,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: { target: YtPlayer }) => {
            const available = event.target.getAvailablePlaybackRates?.() ?? [
              1,
            ];
            setRates(available);
          },
        },
      }) as YtPlayer;

      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [id, mountId]);

  function changeRate(next: number) {
    playerRef.current?.setPlaybackRate(next);
    setRate(next);
  }

  function step(direction: -1 | 1) {
    const player = playerRef.current;
    if (!player) {
      return;
    }
    player.pauseVideo();
    const now = player.getCurrentTime();
    player.seekTo(Math.max(0, now + direction * FRAME), true);
  }

  const slowRates = rates.filter((r) => r < 1);

  return (
    <div className="video-block">
      <div className="video-frame">
        <div id={mountId} title={title} />
      </div>
      <div className="video-controls" role="group" aria-label="Velocidad del video">
        {slowRates.map((r) => (
          <button
            key={r}
            type="button"
            className={rate === r ? "btn btn-primary" : "btn btn-secondary"}
            onClick={() => changeRate(r)}
          >
            {r === 0.25 ? "Cámara lenta" : `${r}×`}
          </button>
        ))}
        <button
          type="button"
          className={rate === 1 ? "btn btn-primary" : "btn btn-secondary"}
          onClick={() => changeRate(1)}
        >
          Normal
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => step(-1)}
        >
          ← Un poco atrás
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => step(1)}
        >
          Un poco adelante →
        </button>
      </div>
      <p className="video-hint">
        Cámara lenta usa la velocidad de YouTube (hasta 0,25×). Atrás/adelante
        salta ~un fotograma; no es preciso al milímetro.
      </p>
    </div>
  );
}

export function VideoEmbed({ url, title }: VideoEmbedProps) {
  const video = parseVideoUrl(url);
  if (!video) {
    return null;
  }

  if (video.provider === "youtube") {
    return <YouTubePlayer id={video.id} title={title} />;
  }

  return (
    <div className="video-frame">
      <iframe
        src={`https://player.vimeo.com/video/${video.id}`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string, options: Record<string, unknown>) => YtPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
