"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Mascot } from "./Brand";

type Item = { id: string; public_url: string; title: string; caption: string; kind?: "video" | "photo" };

const PHOTO_MS = 6000; // how long a photo stays up
const VIDEO_MAX_MS = 20000; // long videos move on after this, even if not finished

/**
 * "Recent jobs" carousel: photos and videos, in the order the plumber sets in the admin.
 * It moves on by itself (photos after 6 s, videos when they end or after 20 s),
 * pauses while you hover or touch it, and has arrows, dots, thumbnails and swipe.
 */
export default function VideoReel({ items }: { items: Item[] }) {
  const n = items.length;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hover, setHover] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const elapsed = useRef(0);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (d: number) => {
      if (!n) return;
      setI((x) => (x + d + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  // Reset the timer and start/stop videos whenever the slide changes.
  useEffect(() => {
    elapsed.current = 0;
    setProgress(0);
    videos.current.forEach((v, idx) => {
      if (!v) return;
      if (idx === i) {
        v.currentTime = 0;
        if (playing) v.play().catch(() => {});
      } else v.pause();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  useEffect(() => {
    const v = videos.current[i];
    if (!v) return;
    if (playing && !hover) v.play().catch(() => {});
    else v.pause();
  }, [playing, hover, i]);

  // Auto-advance timer (also drives the progress bar).
  useEffect(() => {
    if (n < 2 || !playing || hover) return;
    const tick = 100;
    const t = window.setInterval(() => {
      const cur = items[i];
      const v = videos.current[i];
      if (cur?.kind === "video" && v) {
        const total = Math.min((v.duration || 20) * 1000, VIDEO_MAX_MS);
        const p = (v.currentTime * 1000) / total;
        setProgress(Math.min(p, 1));
        if (p >= 1) go(1);
      } else {
        elapsed.current += tick;
        setProgress(elapsed.current / PHOTO_MS);
        if (elapsed.current >= PHOTO_MS) go(1);
      }
    }, tick);
    return () => window.clearInterval(t);
  }, [n, playing, hover, i, items, go]);

  if (!n) {
    return (
      <div className="reel" role="region" aria-label="Recent jobs">
        <div className="reel-empty">
          <Mascot size={150} />
          <strong style={{ color: "#fff", fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
            Job videos and photos are on their way
          </strong>
          <span>Short clips and photos of recent repairs and installations will show here.</span>
        </div>
      </div>
    );
  }

  const cur = items[i];
  return (
    <div className="carousel">
      <div
        className="reel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Photos and videos of recent jobs"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <div className="reel-track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {items.map((it, idx) => (
            <div className="reel-slide" key={it.id} aria-hidden={idx !== i} aria-roledescription="slide" aria-label={`${idx + 1} of ${n}`}>
              {it.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.public_url} alt={it.title || "Recent job"} className={`reel-img ${idx === i ? "is-on" : ""}`} loading={idx === 0 ? "eager" : "lazy"} />
              ) : (
                <video
                  ref={(el) => {
                    videos.current[idx] = el;
                  }}
                  src={it.public_url}
                  muted={muted}
                  playsInline
                  preload={idx === i ? "auto" : "metadata"}
                  loop={n === 1}
                  onEnded={() => n > 1 && go(1)}
                  aria-label={it.title || "Recent job video"}
                />
              )}
            </div>
          ))}
        </div>

        {n > 1 && (
          <>
            <button className="reel-arrow reel-arrow--prev" onClick={() => go(-1)} aria-label="Previous">
              <ChevronLeft size={26} />
            </button>
            <button className="reel-arrow reel-arrow--next" onClick={() => go(1)} aria-label="Next">
              <ChevronRight size={26} />
            </button>
          </>
        )}

        <div className="reel-bar">
          <div>
            <div className="reel-title">{cur.title || "Recent job"}</div>
            {cur.caption && <div className="reel-sub">{cur.caption}</div>}
          </div>
          <div className="reel-ctrl">
            <span className="reel-count">{i + 1} / {n}</span>
            <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause slideshow" : "Play slideshow"}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            {cur.kind !== "photo" && (
              <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-pressed={!muted}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            )}
          </div>
        </div>
        {n > 1 && (
          <div className="reel-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>
        )}
      </div>

      {n > 1 && (
        <div className="reel-thumbs" role="group" aria-label="Choose a photo or video">
          {items.map((it, idx) => (
            <button key={it.id} onClick={() => setI(idx)} aria-current={idx === i} aria-label={`${idx + 1}: ${it.title || "Recent job"}`}>
              {it.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.public_url} alt="" loading="lazy" />
              ) : (
                <>
                  <video src={`${it.public_url}#t=0.5`} muted playsInline preload="metadata" />
                  <span className="reel-thumb-play"><Play size={14} /></span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
