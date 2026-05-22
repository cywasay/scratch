"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";

export const IDENTITY = "MUHAMMAD WASAY";

export function HeroNameBlock({ burst, onBurst }) {
  return (
    <>
      <div className="relative mb-1" onClick={onBurst}>
        <h1
          className={`glitch-name flicker-text font-mono text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tight ${
            burst ? "glitch-burst" : ""
          }`}
          data-text="MUHAMMAD"
        >
          {"MUHAMMAD".split("").map((letter, i) => (
            <GlitchLetter
              key={`m-${i}`}
              char={letter}
              color="white"
              glowColor="rgba(0,255,65,0.15)"
            />
          ))}
        </h1>
      </div>

      <div className="relative mb-6" onClick={onBurst}>
        <h1
          className={`glitch-name font-mono text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-none tracking-tight ${
            burst ? "glitch-burst" : ""
          }`}
          data-text="WASAY"
        >
          {"WASAY".split("").map((letter, i) => (
            <GlitchLetter
              key={`w-${i}`}
              char={letter}
              color="#00ff41"
              glowColor="rgba(0,255,65,0.3)"
            />
          ))}
        </h1>
      </div>
    </>
  );
}

const GlitchLetter = ({
  char,
  color = "white",
  glowColor = "rgba(0,255,65,0.15)",
}) => {
  const [active, setActive] = useState(false);
  const [scramble, setScramble] = useState(char);

  const trigger = useCallback(() => {
    setActive(true);
    const chars = "01!@#$%&ABCDEF";
    let count = 0;
    const interval = setInterval(() => {
      setScramble(chars[Math.floor(Math.random() * chars.length)]);
      count++;
      if (count > 6) {
        clearInterval(interval);
        setScramble(char);
        setActive(false);
      }
    }, 50);
  }, [char]);

  return (
    <span
      onMouseEnter={trigger}
      onTouchStart={trigger}
      className="inline-block cursor-pointer transition-transform duration-100"
      style={{
        color: active ? "#00ff41" : color,
        textShadow: active
          ? `0 0 20px #00ff41, 0 0 40px #00ff41, 0 0 80px rgba(0,255,65,0.4)`
          : `0 0 20px ${glowColor}`,
        transform: active
          ? `translateY(${Math.random() > 0.5 ? -3 : 3}px) translateX(${Math.random() > 0.5 ? -2 : 2}px) scaleY(${Math.random() > 0.5 ? 1.1 : 0.95})`
          : "none",
      }}
    >
      {scramble}
    </span>
  );
};

function splitIdentity(text) {
  const value = text || IDENTITY;
  const space = value.indexOf(" ");
  if (space === -1) return { first: value, second: "" };
  return { first: value.slice(0, space), second: value.slice(space + 1) };
}

// Phases:
//   "loader"  — small, centered (under reticle), single line
//   "morph"   — animating to hero position, growing, splitting into two lines
//   "hero"    — final hero placement, glitch letters active
export default function IdentityOverlay({
  phase,
  identityText,
  resolved,
  burst,
  onBurst,
  onMorphComplete,
}) {
  const { first, second } = splitIdentity(identityText);
  const settled = phase === "hero";

  // Discrete state targets. We animate between them with framer.
  const isLoader = phase === "loader";

  // Loader: centered horizontally, ~56% vertical (under reticle), small.
  // Hero: anchored to left edge, vertically centered.
  // We use percentages + transforms so it works on any viewport.
  const target = isLoader
    ? {
        top: "56%",
        left: "50%",
        x: "-50%",
        y: "-50%",
        scale: 1,
      }
    : {
        top: "50%",
        left: "clamp(2.5rem, 6vw, 7rem)",
        x: "0%",
        y: "-50%",
        scale: 1,
      };

  return (
    <motion.div
      initial={false}
      animate={target}
      transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
      onAnimationComplete={() => {
        if (phase === "morph") onMorphComplete?.();
      }}
      className="fixed z-[10001] font-mono uppercase select-none pointer-events-none"
      style={{ transformOrigin: "left center" }}
    >
      {isLoader ? (
        // Loader appearance — single compact line under the reticle
        <div className="flex flex-wrap items-baseline justify-center gap-x-2 text-lg md:text-xl font-black tracking-[0.22em] whitespace-nowrap">
          <motion.span
            animate={{
              color: resolved ? "#e8ffe8" : "rgba(200, 255, 220, 0.75)",
            }}
            style={{
              textShadow: resolved
                ? "0 0 16px rgba(0,255,65,0.45)"
                : "0 0 10px rgba(0,255,65,0.2)",
            }}
          >
            {first}
          </motion.span>
          <motion.span
            animate={{
              color: resolved ? "#00ff41" : "rgba(0, 255, 65, 0.55)",
            }}
            style={{
              textShadow: resolved ? "0 0 14px rgba(0,255,65,0.35)" : "none",
            }}
          >
            {second}
          </motion.span>
        </div>
      ) : (
        // Hero appearance — two stacked giant lines, scaling up
        <motion.div
          initial={{ scale: 0.18, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
          style={{ transformOrigin: "left center" }}
          className="pointer-events-auto"
        >
          <div className="mb-1" onClick={settled ? onBurst : undefined}>
            <h1
              className={`font-black leading-none tracking-tight text-white text-7xl md:text-8xl lg:text-9xl ${
                settled ? `glitch-name ${burst ? "glitch-burst" : ""}` : ""
              }`}
              data-text={settled ? "MUHAMMAD" : undefined}
            >
              {settled
                ? "MUHAMMAD".split("").map((letter, i) => (
                    <GlitchLetter
                      key={`m-${i}`}
                      char={letter}
                      color="white"
                      glowColor="rgba(0,255,65,0.15)"
                    />
                  ))
                : "MUHAMMAD"}
            </h1>
          </div>

          <div onClick={settled ? onBurst : undefined}>
            <h1
              className={`font-black leading-none tracking-tight text-7xl md:text-8xl lg:text-9xl ${
                settled ? `glitch-name ${burst ? "glitch-burst" : ""}` : ""
              }`}
              data-text={settled ? "WASAY" : undefined}
              style={{ color: "#00ff41" }}
            >
              {settled
                ? "WASAY".split("").map((letter, i) => (
                    <GlitchLetter
                      key={`w-${i}`}
                      char={letter}
                      color="#00ff41"
                      glowColor="rgba(0,255,65,0.3)"
                    />
                  ))
                : "WASAY"}
            </h1>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
