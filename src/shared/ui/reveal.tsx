"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || preference.matches || !("IntersectionObserver" in window))
      return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.dataset.reveal = "waiting";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    const show = () => {
      if (preference.matches) {
        delete element.dataset.reveal;
        observer.disconnect();
      }
    };
    preference.addEventListener("change", show);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", show);
      delete element.dataset.reveal;
    };
  }, []);
  return (
    <div ref={ref} className="home-reveal">
      {children}
    </div>
  );
}
