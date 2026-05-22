"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_MS = 4200;
const PAUSE_MS = 400;
const EXIT_MS = 900;

const BEATS = [
  { t: 0, p: 0, status: "KERNEL BOOT...", prompt: "> neural_link // cold_start" },
  { t: 500, p: 12, status: "SCANNING GRID...", prompt: "> sector map loaded" },
  { t: 1000, p: 28, status: "BIOMETRIC TRACE...", prompt: "> signal detected" },
  { t: 1600, p: 42, status: "MATCHING SUBJECT...", identity: "scramble" },
  { t: 2200, p: 58, status: "DECRYPTING IDENTITY...", identity: "partial" },
  { t: 2800, p: 72, status: "RESOLVING HASH...", identity: "decode" },
  { t: 3400, p: 86, status: "SYNCING NEURAL CORE...", prompt: "> subject locked" },
  { t: 3800, p: 94, status: "UPLINK STABLE...", prompt: "> awaiting handoff" },
  { t: BOOT_MS, p: 100, status: "ACCESS GRANTED", prompt: "> link established" },
];

const IDENTITY = "MUHAMMAD WASAY";
const SCRAMBLE_CHARS = "01!@#$%&*ABCDEF█▓▒░";

function getBeat(elapsed) {
  let beat = BEATS[0];
  for (const b of BEATS) {
    if (elapsed >= b.t) beat = b;
    else break;
  }
  return beat;
}

function lerpBeatProgress(elapsed) {
  for (let i = 0; i < BEATS.length - 1; i++) {
    const a = BEATS[i];
    const b = BEATS[i + 1];
    if (elapsed >= a.t && elapsed < b.t) {
      const ratio = (elapsed - a.t) / (b.t - a.t);
      return a.p + (b.p - a.p) * ratio;
    }
  }
  return elapsed >= BOOT_MS ? 100 : 0;
}

function getIdentityDisplay(phase, progress, frame) {
  if (!phase || phase === "hidden") return null;

  const resolvedCount =
    phase === "scramble"
      ? 0
      : phase === "partial"
        ? Math.floor(IDENTITY.length * 0.35)
        : phase === "decode"
          ? Math.floor(IDENTITY.length * (0.35 + ((progress - 58) / 42) * 0.65))
          : IDENTITY.length;

  return IDENTITY.split("")
    .map((char, i) => {
      if (char === " ") return " ";
      if (i < resolvedCount) return char;
      return SCRAMBLE_CHARS[(i + frame) % SCRAMBLE_CHARS.length];
    })
    .join("");
}

function drawBracket(ctx, x, y, sx, sy, size, alpha) {
  ctx.strokeStyle = `rgba(0, 255, 65, ${alpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + sx * size, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + sy * size);
  ctx.stroke();
}

const SiteLoader = ({ onComplete, onExitStart, onBootUpdate }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(BEATS[0].status);
  const [prompt, setPrompt] = useState(BEATS[0].prompt);
  const [isExiting, setIsExiting] = useState(false);
  const [canEnter, setCanEnter] = useState(false);
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const progressRef = useRef(0);
  const exitStartedRef = useRef(false);
  const exitStartTimeRef = useRef(0);
  const startTimeRef = useRef(null);
  const accumulatedRef = useRef(0); // elapsed time accounting that survives tab visibility changes
  const animRef = useRef(null);

  // Ref-pin callbacks so the boot effect doesn't restart when the parent
  // re-renders and passes fresh function identities.
  const callbacksRef = useRef({ onComplete, onExitStart, onBootUpdate });
  useEffect(() => {
    callbacksRef.current = { onComplete, onExitStart, onBootUpdate };
  }, [onComplete, onExitStart, onBootUpdate]);

  const triggerExit = useCallback(() => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;
    exitStartTimeRef.current = performance.now();
    setCanEnter(false);
    setIsExiting(true);
    callbacksRef.current.onExitStart?.();
    setTimeout(() => {
      setVisible(false);
      callbacksRef.current.onComplete?.();
    }, EXIT_MS);
  }, []);

  // Single, stable boot timeline — never restarts.
  useEffect(() => {
    let lastNow = performance.now();
    startTimeRef.current = lastNow;
    accumulatedRef.current = 0;

    const tick = (now) => {
      // Use delta-accumulation so a hidden tab (paused RAF) doesn't
      // suddenly jump the elapsed time on return.
      const delta = Math.min(100, now - lastNow); // clamp big gaps
      lastNow = now;
      accumulatedRef.current += delta;
      const elapsed = accumulatedRef.current;

      const p = lerpBeatProgress(elapsed);
      const beat = getBeat(elapsed);

      progressRef.current = p;
      setProgress(p);
      setStatus(beat.status);
      if (beat.prompt) setPrompt(beat.prompt);
      frameRef.current++;
      const phase = beat.identity ?? (p >= 86 ? "resolved" : null);
      const text =
        getIdentityDisplay(phase, p, frameRef.current) ??
        (p >= 86 ? IDENTITY : "");
      callbacksRef.current.onBootUpdate?.({
        progress: p,
        identityText: text,
        showIdentity: !!phase,
        identityResolved: p >= 86,
      });

      if (elapsed >= BOOT_MS && !exitStartedRef.current) {
        setCanEnter(true);
        if (elapsed >= BOOT_MS + PAUSE_MS) {
          triggerExit();
          return;
        }
      }

      animRef.current = requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      // Reset lastNow on visibility return so the first delta after
      // resume is tiny (we don't credit the away time).
      if (document.visibilityState === "visible") {
        lastNow = performance.now();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    animRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // Intentionally empty — boot timeline runs exactly once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let rafId;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const p = progressRef.current / 100;
      const frames = frameRef.current;
      const exitT = exitStartedRef.current
        ? Math.min(1, (performance.now() - exitStartTimeRef.current) / EXIT_MS)
        : 0;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      const gridAlpha = (0.02 + p * 0.05) * (1 - exitT * 0.8);
      ctx.strokeStyle = `rgba(0, 255, 65, ${gridAlpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      const gridStep = 48;
      for (let x = 0; x < w; x += gridStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += gridStep) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      const cx = w / 2;
      const cy = h * 0.36;
      const baseRadius = 56 + p * 28;
      const exitExpand = 1 + exitT * 1.8;
      const masterAlpha = 1 - exitT * exitT;

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 2.8 * exitExpand);
      glow.addColorStop(0, `rgba(0, 255, 65, ${(0.06 + p * 0.14) * masterAlpha})`);
      glow.addColorStop(0.45, `rgba(0, 255, 200, ${(0.02 + p * 0.06) * masterAlpha})`);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const bracketPad = Math.max(48, Math.min(w, h) * 0.14) - p * 8 - exitT * 20;
      const bracketSize = 18 + p * 6;
      const bracketAlpha = (0.25 + p * 0.45) * masterAlpha;
      drawBracket(ctx, cx - bracketPad, cy - bracketPad, 1, 1, bracketSize, bracketAlpha);
      drawBracket(ctx, cx + bracketPad, cy - bracketPad, -1, 1, bracketSize, bracketAlpha);
      drawBracket(ctx, cx - bracketPad, cy + bracketPad, 1, -1, bracketSize, bracketAlpha);
      drawBracket(ctx, cx + bracketPad, cy + bracketPad, -1, -1, bracketSize, bracketAlpha);

      const rings = [
        { r: 0.55, width: 0.75, alpha: 0.12 },
        { r: 0.78, width: 1, alpha: 0.22 },
        { r: 1.0, width: 1.5, alpha: 0.35 + p * 0.35 },
      ];

      for (const ring of rings) {
        const r = baseRadius * ring.r * exitExpand;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 65, ${ring.alpha * masterAlpha})`;
        ctx.lineWidth = ring.width;
        ctx.stroke();
      }

      const arcRadius = baseRadius * exitExpand;
      const startAngle = -Math.PI / 2;
      const sweep = Math.PI * 2 * Math.min(p + exitT * 0.15, 1);
      ctx.beginPath();
      ctx.arc(cx, cy, arcRadius, startAngle, startAngle + sweep);
      ctx.strokeStyle = `rgba(180, 255, 210, ${(0.55 + p * 0.4) * masterAlpha})`;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();

      const tickCount = 36;
      for (let i = 0; i < tickCount; i++) {
        const angle = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
        const active = i / tickCount <= p;
        const inner = arcRadius + 6;
        const outer = inner + (active ? 5 : 3);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        ctx.strokeStyle = `rgba(0, 255, 65, ${(active ? 0.55 : 0.12) * masterAlpha})`;
        ctx.lineWidth = active ? 1.2 : 0.75;
        ctx.stroke();
      }

      ctx.strokeStyle = `rgba(0, 255, 65, ${(0.15 + p * 0.25) * masterAlpha})`;
      ctx.lineWidth = 0.75;
      const gap = 14;
      ctx.beginPath();
      ctx.moveTo(cx, cy - arcRadius - 10);
      ctx.lineTo(cx, cy - gap);
      ctx.moveTo(cx, cy + gap);
      ctx.lineTo(cx, cy + arcRadius + 10);
      ctx.moveTo(cx - arcRadius - 10, cy);
      ctx.lineTo(cx - gap, cy);
      ctx.moveTo(cx + gap, cy);
      ctx.lineTo(cx + arcRadius + 10, cy);
      ctx.stroke();

      const corePulse = 2.5 + Math.sin(frames * 0.07) * 1.2 + p * 2;
      const coreAlpha = (0.5 + p * 0.5) * masterAlpha;
      ctx.fillStyle = `rgba(210, 255, 230, ${coreAlpha})`;
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur = 10 + p * 18;
      ctx.beginPath();
      ctx.arc(cx, cy, corePulse + exitT * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const orbitR = arcRadius;
      const orbitAngle = frames * (0.018 + p * 0.025) + exitT * 2.5;
      ctx.fillStyle = `rgba(0, 255, 65, ${0.85 * masterAlpha})`;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(orbitAngle) * orbitR,
        cy + Math.sin(orbitAngle) * orbitR,
        2.5 - exitT * 0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      if (exitT > 0) {
        const pulseRing = arcRadius * (1 + exitT * 2.2);
        ctx.beginPath();
        ctx.arc(cx, cy, pulseRing, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 200, ${0.35 * (1 - exitT)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const wipeY = exitT * (h + 40) - 20;
        const beam = ctx.createLinearGradient(0, wipeY - 50, 0, wipeY + 12);
        beam.addColorStop(0, "rgba(0, 255, 65, 0)");
        beam.addColorStop(0.55, `rgba(180, 255, 220, ${0.25 * (1 - exitT * 0.5)})`);
        beam.addColorStop(0.75, `rgba(255, 255, 255, ${0.55 * (1 - exitT * 0.3)})`);
        beam.addColorStop(1, "rgba(0, 255, 65, 0)");
        ctx.fillStyle = beam;
        ctx.fillRect(0, wipeY - 50, w, 62);

        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.65, exitT * 0.85)})`;
        ctx.fillRect(0, wipeY + 6, w, h - wipeY);
      } else {
        const scanSpeed = 1.2 + p * 4;
        const scanY = (frames * scanSpeed) % (h + 100) - 50;
        const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
        scanGrad.addColorStop(0, "rgba(0, 255, 65, 0)");
        scanGrad.addColorStop(0.5, `rgba(0, 255, 200, ${0.03 + p * 0.08})`);
        scanGrad.addColorStop(1, "rgba(0, 255, 65, 0)");
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 30, w, 60);
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const flickerIntensity = 0.06 + (progress / 100) * 0.12;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={
            isExiting
              ? { duration: EXIT_MS / 1000, ease: [0.4, 0, 0.2, 1] }
              : {}
          }
          onClick={() => canEnter && triggerExit()}
          className={`fixed inset-0 z-[9999] bg-black overflow-hidden font-mono flex flex-col items-center justify-center ${
            canEnter ? "cursor-pointer" : "cursor-wait"
          }`}
        >
          <canvas ref={canvasRef} className="absolute inset-0" />

          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              background:
                "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.22) 50%), linear-gradient(90deg, rgba(255,0,0,0.05), rgba(0,255,0,0.02), rgba(0,0,255,0.05))",
              backgroundSize: "100% 2px, 3px 100%",
              opacity: (0.7 + flickerIntensity) * (isExiting ? 0.4 : 1),
              animation: isExiting
                ? "none"
                : `hologram-flicker ${0.18 - progress * 0.001}s steps(2) infinite`,
            }}
          />

          <motion.div
            animate={{
              opacity: isExiting ? 0 : 1,
              y: isExiting ? 16 : 0,
              filter: isExiting ? "blur(6px)" : "blur(0px)",
            }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 flex flex-col items-center w-full max-w-lg px-6 mt-44 md:mt-52"
          >
            <div
              className="w-full bg-[#000a08]/80 border p-5 backdrop-blur-sm relative overflow-hidden"
              style={{ borderColor: `rgba(0, 255, 65, ${0.15 + progress * 0.004})` }}
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-green-500/60" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-green-500/60" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-green-500/60" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-green-500/60" />

              <div className="space-y-3">
                <div className="flex justify-between text-[9px] text-green-500/40 uppercase tracking-[0.3em]">
                  <span>Neural_Link // MW-882</span>
                  <span>{Math.round(progress).toString().padStart(3, "0")}%</span>
                </div>

                <div className="flex gap-3 items-start">
                  <div
                    className="w-1.5 h-1.5 mt-1.5 shrink-0 rounded-full animate-pulse"
                    style={{
                      backgroundColor: "#00ff41",
                      boxShadow: `0 0 ${6 + progress * 0.2}px #00ff41`,
                    }}
                  />
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-[11px] md:text-xs text-white font-bold tracking-[0.2em] uppercase">
                      {status}
                    </p>
                    <p className="text-[10px] text-green-500/50 tracking-wide truncate">
                      {prompt}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-1.5 pt-3 border-t border-green-500/10 text-[8px] text-green-500/45 uppercase tracking-widest">
                  <span>Core_Sync</span>
                  <span className="text-right text-white/70">
                    {progress < 50 ? "pending" : progress < 86 ? "partial" : "locked"}
                  </span>
                  <span>Subject_Hash</span>
                  <span className="text-right text-green-400/80 font-bold">
                    {progress >= 72 ? "MW//RESOLVED" : "████████"}
                  </span>
                </div>
              </div>

              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(0,255,65,0.08), transparent)",
                  animation: `hologram-scan ${3.2 - progress * 0.025}s linear infinite`,
                }}
              />
            </div>

            {canEnter && !isExiting && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="mt-6 text-[9px] tracking-[0.4em] uppercase text-green-500/40"
              >
                click to link
              </motion.p>
            )}
          </motion.div>

          <motion.div
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-0 left-0 right-0 z-10 h-[2px] bg-green-950/80"
          >
            <div
              className="h-full bg-gradient-to-r from-green-700 via-green-400 to-green-200"
              style={{
                width: `${progress}%`,
                boxShadow: `0 0 ${8 + progress * 0.3}px rgba(0,255,65,0.5)`,
              }}
            />
          </motion.div>

          <motion.div
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-8 left-8 right-8 flex justify-between items-end z-10 pointer-events-none"
          >
            <div className="flex flex-col gap-2">
              <div className="flex gap-1">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-3 transition-colors duration-150"
                    style={{
                      backgroundColor:
                        i < Math.floor(progress / 6.25)
                          ? `rgba(0, 255, 65, ${0.4 + (i / 16) * 0.6})`
                          : "rgba(0, 40, 20, 0.8)",
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] text-green-500/25 uppercase tracking-[0.45em]">
                Subject_Authorization
              </span>
            </div>

            <div className="text-right font-mono text-[8px] text-green-900/60 uppercase tracking-widest">
              <div>Terminal // 882-AG-BETA</div>
              <div className="text-green-500/30 mt-0.5">MW // NEURAL LINK</div>
            </div>
          </motion.div>

          <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_180px_rgba(0,0,0,0.9)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SiteLoader;
