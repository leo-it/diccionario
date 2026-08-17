type VideoEmbedProps = {
  url: string;
  title: string;
};

type ParsedVideo =
  | { provider: "youtube"; id: string }
  | { provider: "vimeo"; id: string };

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

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
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

export function VideoEmbed({ url, title }: VideoEmbedProps) {
  const video = parseVideoUrl(url);
  if (!video) {
    return null;
  }

  const src =
    video.provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${video.id}`
      : `https://player.vimeo.com/video/${video.id}`;

  return (
    <div className="mt-8 aspect-video overflow-hidden rounded-lg bg-zinc-100">
      <iframe
        src={src}
        title={title}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
