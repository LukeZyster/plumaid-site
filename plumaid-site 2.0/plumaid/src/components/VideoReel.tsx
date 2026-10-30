"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mascot } from "./Brand";
import { IconNext, IconPause, IconPlay, IconPrev } from "./Icons";

type Item = { id: string; public_url: string; title: string; caption: string };

export default function VideoReel({ items }: { items: Item[] }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const touchX = useRef<number | null>(null);
  const n = items.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) setPlaying(false);
  }, []);

  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) v.play().catch(() => setPlaying(false));
    else v.pause();
  }, [playing, i]);

  if (!n) {
    return (
      <div className="reel" role="region" aria-label="Recent jobs">
        <div className="reel-empty">
          <Mascot size={150} />
          <strong style={{ color: "#fff", fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
            Job videos are on their way
          </strong>
          <span>Short clips of recent repairs and installations will play here.</span>
        </div>
      </div>
    );
  }

  const cur = items[i];
  return (
    <div>
      <div
        className="reel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Videos of recent jobs"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <video
          ref={ref}
          key={cur.id}
          src={cur.public_url}
          muted={muted}
          playsInline
          autoPlay={!reduced}
          loop={n === 1}
          preload="metadata"
          onEnded={() => n > 1 && go(1)}
          aria-label={cur.title || "Recent job video"}
        />
        <div className="reel-bar">
          <div>
            <div className="reel-title">{cur.title || "Recent job"}</div>
            {cur.caption && <div className="reel-sub">{cur.caption}</div>}
          </div>
          <div className="reel-ctrl">
            {n > 1 && (
              <button onClick={() => go(-1)} aria-label="Previous video"><IconPrev /></button>
            )}
            <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause video" : "Play video"}>
              {playing ? <IconPause /> : <IconPlay />}
            </button>
            <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-pressed={!muted}>
              <span aria-hidden="true" style={{ fontSize: 18 }}>{muted ? "🔇" : "🔊"}</span>
            </button>
            {n > 1 && (
              <button onClick={() => go(1)} aria-label="Next video"><IconNext /></button>
            )}
          </div>
        </div>
      </div>
      {n > 1 && (
        <div className="reel-dots" role="group" aria-label="Choose a video">
          {items.map((it, idx) => (
            <button key={it.id} onClick={() => setI(idx)} aria-label={`Video ${idx + 1}: ${it.title || "Recent job"}`} aria-current={idx === i} />
          ))}
        </div>
      )}
    </div>
  );
}
