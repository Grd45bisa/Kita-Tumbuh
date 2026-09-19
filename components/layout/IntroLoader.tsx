"use client";

import { useEffect, useRef, useState } from "react";
import { LeafLoader } from "@/components/ui/LeafLoader";
import styles from "./IntroLoader.module.css";

const SESSION_KEY = "kt-leaf-intro-seen-v2";
const MIN_DISPLAY_MS = 2000;
const EXIT_MS = 350;
// Safety net: don't wait forever for an animationiteration event that
// might never fire (e.g. an unusual browser). Slightly longer than one
// leaf-flight cycle (2s).
const CYCLE_WAIT_TIMEOUT_MS = 2200;

export function IntroLoader() {
  // Start empty so repeat visits and pages without JavaScript stay accessible.
  const [phase, setPhase] = useState<"hidden" | "playing" | "leaving">("hidden");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      // The intro still works if session storage is unavailable.
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers: number[] = [];
    let ready = document.readyState === "complete";
    let minimumElapsed = false;
    let waitingForCycle = false;
    let leaving = false;

    const fadeOut = () => {
      if (leaving) return;
      leaving = true;
      setPhase("leaving");
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Storage is optional; never hold the page open for it.
      }
      timers.push(window.setTimeout(() => setPhase("hidden"), EXIT_MS));
    };

    // Let the leaf finish the flight cycle it's currently mid-way through
    // (flight + roll + glide) instead of cutting it off, then fade out.
    const exit = () => {
      if (waitingForCycle || leaving) return;
      waitingForCycle = true;

      const animatedEl = overlayRef.current?.querySelector<HTMLElement>("[data-leaf-cycle]");
      if (!animatedEl) {
        fadeOut();
        return;
      }

      // Freeze the animation right as a cycle completes so the leaf holds
      // still (already faded to invisible at the end of its flight) instead
      // of visibly launching into a new cycle while the overlay fades out.
      const freezeAndFade = () => {
        animatedEl.removeEventListener("animationiteration", onIteration);
        overlayRef.current?.querySelectorAll<HTMLElement>("[data-leaf-cycle], [data-leaf-cycle] *")
          .forEach((el) => { el.style.animationPlayState = "paused"; });
        fadeOut();
      };
      const onIteration = () => freezeAndFade();
      animatedEl.addEventListener("animationiteration", onIteration);
      // Fallback in case the animation is paused/removed/never iterates.
      timers.push(window.setTimeout(freezeAndFade, CYCLE_WAIT_TIMEOUT_MS));
    };

    const onReady = () => {
      ready = true;
      if (minimumElapsed) exit();
    };

    setPhase("playing");
    window.addEventListener("load", onReady, { once: true });
    timers.push(window.setTimeout(() => {
      minimumElapsed = true;
      if (ready) exit();
    }, MIN_DISPLAY_MS));
    window.addEventListener("keydown", onKeyDown);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") fadeOut();
    }

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener("load", onReady);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const visible = phase !== "hidden";
  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    const page = overlayRef.current?.nextElementSibling;
    const pageElement = page instanceof HTMLElement ? page : null;
    const previousInert = pageElement?.inert ?? false;
    document.body.style.overflow = "hidden";
    if (pageElement) pageElement.inert = true;
    return () => {
      document.body.style.overflow = previousOverflow;
      if (pageElement) pageElement.inert = previousInert;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={overlayRef} className={`${styles.overlay} ${phase === "leaving" ? styles.leaving : ""}`}>
      <LeafLoader />
    </div>
  );
}
