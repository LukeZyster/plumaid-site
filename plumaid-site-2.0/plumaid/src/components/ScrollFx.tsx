"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Site-wide motion:
 *  - sections and cards float up into view as you scroll (staggered inside grids)
 *  - the header tightens and gets a shadow once you scroll
 * Respects "reduce motion" settings.
 */
const TARGETS = [
  ".section-head",
  ".svc",
  ".step",
  ".review",
  ".gallery .ph",
  ".reel",
  ".bcal-card",
  ".bcal-side",
  ".team-row > div:first-child",
  ".cta-inner > div",
  ".card",
  ".story-grid > *",
  ".prose > *",
  ".contact-grid > *",
].join(",");

export default function ScrollFx() {
  const path = usePathname();

  useEffect(() => {
    const header = document.querySelector(".site-header");
    const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Note: effects can run twice (React dev mode / route changes), so never skip elements
    // that were already prepared — just re-observe anything not yet revealed.
    const els = Array.from(document.querySelectorAll<HTMLElement>(TARGETS)).filter(
      (el) => !el.closest(".bmodal") && !el.classList.contains("rv-in"),
    );
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("rv", "rv-in"));
      return;
    }
    // Stagger siblings that share a parent (cards in a grid, steps in a row…)
    const counts = new Map<Element, number>();
    for (const el of els) {
      const p = el.parentElement!;
      const i = counts.get(p) ?? 0;
      counts.set(p, i + 1);
      el.style.setProperty("--rv-delay", `${Math.min(i, 6) * 90}ms`);
      el.classList.add("rv");
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("rv-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    // Safety net: never leave anything hidden if the observer misses it.
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll(".rv:not(.rv-in)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 1.5) el.classList.add("rv-in");
      });
    }, 1500);
    const onScrollReveal = () => {
      document.querySelectorAll(".rv:not(.rv-in)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add("rv-in");
      });
    };
    window.addEventListener("scroll", onScrollReveal, { passive: true });
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
      window.removeEventListener("scroll", onScrollReveal);
    };
  }, [path]);

  return null;
}
