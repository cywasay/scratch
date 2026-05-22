"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { HeroNameBlock } from "@/components/IdentityHandoff";

const SIGNATURE_LINE = "I build interfaces that feel like machines waking up.";

const SIGNAL_READOUT = [
  ["MODE", "CINEMATIC_WEB"],
  ["FOCUS", "MOTION_SYSTEMS"],
  ["OUTPUT", "IMMERSIVE_UI"],
];

const HeroSection = ({ revealed = false, contentRevealed = false }) => {
  const [mounted, setMounted] = useState(false);
  const [typedLine, setTypedLine] = useState("");
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (!contentRevealed) return;
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, [contentRevealed]);

  useEffect(() => {
    if (!contentRevealed) return;
    setTypedLine("");

    let index = 0;
    let interval;
    const delay = setTimeout(() => {
      interval = setInterval(() => {
        index += 1;
        setTypedLine(SIGNATURE_LINE.slice(0, index));
        if (index >= SIGNATURE_LINE.length) clearInterval(interval);
      }, 28);
    }, 280);

    return () => {
      clearTimeout(delay);
      if (interval) clearInterval(interval);
    };
  }, [contentRevealed]);

  const handleBurst = useCallback(() => {
    setBurst(true);
    setTimeout(() => setBurst(false), 400);
  }, []);

  return (
    <div className="relative overflow-hidden">
      <motion.section
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-start justify-center min-h-screen w-full px-10 md:px-20 lg:px-28 select-none"
      >
        <div
          className={`flex items-center gap-3 mb-8 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <span className="text-green-500/40 font-mono text-xs uppercase tracking-[0.3em]">
            MW // SIGNAL ACQUIRED
          </span>
          <div className="h-[1px] w-20 bg-gradient-to-r from-green-500/40 to-transparent" />
        </div>

        <div className="text-left w-full max-w-7xl">
          <div
            className={`mb-4 transition-all duration-700 delay-75 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <span className="font-mono text-lg text-green-500/50 tracking-widest uppercase">
              {"> "}run /identity/muhammad-wasay
            </span>
          </div>

          {contentRevealed ? (
            <HeroNameBlock burst={burst} onBurst={handleBurst} />
          ) : (
            <div aria-hidden className="invisible pointer-events-none select-none">
              <div className="mb-1">
                <h1 className="font-black leading-none tracking-tight text-7xl md:text-8xl lg:text-9xl">
                  MUHAMMAD
                </h1>
              </div>
              <div className="mb-6">
                <h1 className="font-black leading-none tracking-tight text-7xl md:text-8xl lg:text-9xl">
                  WASAY
                </h1>
              </div>
            </div>
          )}

          <div className="mt-2 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-end">
            <div
              className={`transition-all duration-700 delay-150 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="mb-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.35em] text-green-500/35">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
                <span>Manifesto Stream</span>
              </div>
              <p className="max-w-2xl text-balance text-lg font-light leading-relaxed tracking-tight text-white/70 md:text-xl">
                {typedLine}
                <span className="ml-1 inline-block h-[0.8em] w-[2px] translate-y-1 bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
              </p>
            </div>

            <div
              className={`transition-all duration-700 delay-300 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="relative overflow-hidden border border-green-500/10 bg-black/30 p-4 font-mono backdrop-blur-sm">
                <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />
                <div className="mb-4 flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-green-500/35">
                  <span>Live Profile</span>
                  <span className="text-green-400/70">OK</span>
                </div>
                <div className="space-y-3">
                  {SIGNAL_READOUT.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 border-t border-white/5 pt-2"
                    >
                      <span className="text-[9px] tracking-[0.25em] text-white/20">
                        {label}
                      </span>
                      <span className="text-right text-[10px] tracking-[0.18em] text-green-400/70">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`absolute bottom-12 left-10 md:left-20 lg:left-28 flex flex-col items-center gap-2 transition-all duration-700 delay-500 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="font-mono text-[10px] text-green-500/25 uppercase tracking-[0.35em]">
            Next Signal
          </span>
          <div className="relative h-10 w-px overflow-hidden bg-green-950">
            <div className="absolute left-0 top-0 h-4 w-px animate-pulse bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HeroSection;
