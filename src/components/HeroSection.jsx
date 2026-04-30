"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const roles = [
  "Software Engineer",
  "Full-Stack Developer",
  "UI/UX Enthusiast",
  "Problem Solver",
];

// Individual letter component with hover/touch interactivity
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

const HeroSection = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [decodedChars, setDecodedChars] = useState([]); 
  const [rolePhase, setRolePhase] = useState("decoding");
  const [mounted, setMounted] = useState(false);
  const [burst, setBurst] = useState(false);
  const [isOpeningGlitch, setIsOpeningGlitch] = useState(true);

  // Opening Materialization Animation
  useEffect(() => {
    // Start the materialization sequence
    const timer = setTimeout(() => {
      setIsOpeningGlitch(false);
      setMounted(true);
    }, 1200); // Duration matches the violent burst
    return () => clearTimeout(timer);
  }, []);

  // Cipher decode effect for roles
  useEffect(() => {
    const currentRole = roles[roleIndex];
    const scrambleChars = "01!@#$%^&*ABCDEF";
    let interval;

    if (rolePhase === "decoding") {
      setDecodedChars(
        currentRole.split("").map((c) => ({
          target: c,
          display: c === " " ? " " : scrambleChars[Math.floor(Math.random() * scrambleChars.length)],
          resolved: c === " ",
        })),
      );

      let resolveIndex = 0;
      interval = setInterval(() => {
        while (resolveIndex < currentRole.length && currentRole[resolveIndex] === " ") {
          resolveIndex++;
        }
        if (resolveIndex >= currentRole.length) {
          clearInterval(interval);
          setRolePhase("display");
          return;
        }

        setDecodedChars((prev) =>
          prev.map((item, i) => {
            if (i < resolveIndex || item.resolved) return { ...item, resolved: true, display: item.target };
            if (i === resolveIndex) return { ...item, resolved: true, display: item.target };
            return { ...item, display: scrambleChars[Math.floor(Math.random() * scrambleChars.length)] };
          }),
        );
        resolveIndex++;
      }, 70);
    } else if (rolePhase === "display") {
      const timeout = setTimeout(() => setRolePhase("glitchOut"), 2500);
      return () => clearTimeout(timeout);
    } else if (rolePhase === "glitchOut") {
      let count = 0;
      interval = setInterval(() => {
        setDecodedChars((prev) =>
          prev.map((item) => ({
            ...item,
            resolved: false,
            display: item.target === " " ? " " : scrambleChars[Math.floor(Math.random() * scrambleChars.length)],
          })),
        );
        count++;
        if (count > 8) {
          clearInterval(interval);
          setRoleIndex((prev) => (prev + 1) % roles.length);
          setRolePhase("decoding");
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [roleIndex, rolePhase]);

  const handleBurst = () => {
    setBurst(true);
    setTimeout(() => setBurst(false), 400);
  };

  return (
    <div className="relative overflow-hidden">
      {/* 1. Opening Materialization Overlay (Violent Glitch) */}
      <AnimatePresence>
        {isOpeningGlitch && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white pointer-events-none"
            animate={{
              opacity: [0, 1, 0.5, 1, 0],
              filter: ["brightness(1)", "brightness(10)", "brightness(1)"],
            }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      <motion.section 
        animate={isOpeningGlitch ? {
          scale: [2, 1],
          filter: ["blur(40px) brightness(0)", "blur(0px) brightness(1)"],
          x: [0, -50, 50, 0],
          skewX: [0, 20, -20, 0]
        } : {}}
        transition={{ duration: 1, ease: "circOut" }}
        className="relative z-10 flex flex-col items-start justify-center min-h-screen w-full px-10 md:px-20 lg:px-28 select-none"
      >
        {/* Top decorative line */}
        <div
          className={`flex items-center gap-3 mb-8 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <span className="text-green-500/40 font-mono text-xs uppercase tracking-[0.3em]">
            Portfolio Terminal v2.0
          </span>
          <div className="w-16 h-[1px] bg-gradient-to-r from-green-500/40 to-transparent" />
        </div>

        {/* Main name block */}
        <div className="text-left">
          {/* Greeting */}
          <div
            className={`mb-4 transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <span className="font-mono text-lg text-green-500/50 tracking-widest uppercase">
              {"> "}initializing_identity . . .
            </span>
          </div>

          {/* Interactive name — MUHAMMAD */}
          <div
            className={`relative mb-1 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            onClick={handleBurst}
          >
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

          {/* Interactive name — WASAY */}
          <div
            className={`relative mb-6 transition-all duration-700 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            onClick={handleBurst}
          >
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

          {/* Cipher decode role */}
          <div
            className={`h-8 flex items-center justify-start gap-2 transition-all duration-700 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <span className="text-green-700 font-mono text-lg">{"$"}</span>
            <span className="font-mono text-xl tracking-wide">
              {decodedChars.map((item, i) => (
                <span
                  key={i}
                  className="inline-block transition-colors duration-75"
                  style={{
                    color: item.resolved ? "rgba(74, 222, 128, 0.85)" : "rgba(0, 255, 65, 0.3)",
                    textShadow: item.resolved ? "0 0 8px rgba(0,255,65,0.4)" : "none",
                    width: item.target === " " ? "0.4em" : "auto",
                  }}
                >
                  {item.display}
                </span>
              ))}
            </span>
            <span className="w-[2px] h-4 bg-green-400 animate-pulse" />
          </div>

          {/* Decorative binary underneath */}
          <div
            className={`mt-8 font-mono text-xs text-green-900/25 tracking-[0.4em] transition-all duration-700 delay-700 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
          >
            01001101 01010111 // MW
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-12 left-10 md:left-20 lg:left-28 flex flex-col items-center gap-2 transition-all duration-700 delay-1000 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="font-mono text-xs text-green-500/30 uppercase tracking-[0.3em]">
            Scroll
          </span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-green-500/40 to-transparent animate-pulse" />
        </div>
      </motion.section>
    </div>
  );
};

export default HeroSection;
