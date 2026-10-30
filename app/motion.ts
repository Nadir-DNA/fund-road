// Moteur d'animation des pages publiques : GSAP + Lenis, comme nadirdaoudi.com
import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin);
export { gsap, ScrollTrigger, SplitText };

export const reduit = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis: Lenis | null = null;

// Lenis = unique moteur de défilement doux, branché sur le ticker GSAP ; ScrollTrigger se remesure quand la page change de hauteur
export function demarrerDefilement() {
  let t = 0,
    h = document.body.scrollHeight;
  const ro = new ResizeObserver(() => {
    if (document.body.scrollHeight === h) return;
    h = document.body.scrollHeight;
    clearTimeout(t);
    t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
  });
  ro.observe(document.body);
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  if (reduit() || lenis) return () => ro.disconnect();
  lenis = new Lenis({ lerp: 0.11 });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
    ro.disconnect();
  };
}

export function allerA(cible: string) {
  const el = document.querySelector<HTMLElement>(cible);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: reduit() ? "auto" : "smooth" });
}

// Contexte GSAP par composant, entièrement annulé au démontage
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  fn: (reduce: boolean) => void | (() => void),
) {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => fn(reduit()), scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// Titres [data-split] révélés mot à mot, blocs [data-reveal] en fondu ; le texte reste lisible sans JS
export function revelerTitres() {
  gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
    SplitText.create(el, {
      type: "words",
      mask: "words",
      autoSplit: true,
      onSplit: (s) =>
        gsap.from(s.words, {
          yPercent: 110,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }),
    });
  });
  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    gsap.from(
      el.children.length && el.dataset.reveal === "stagger" ? el.children : el,
      {
        y: 36,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );
  });
}

// Bouton « aimanté » : suit légèrement le pointeur, seulement avec une souris
export function aimanter(selector: string) {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.25);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener("pointerleave", () => {
      x(0);
      y(0);
    });
  });
}
