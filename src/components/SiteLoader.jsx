"use client";

import React, { useEffect, useRef, useState } from "react";

const SiteLoader = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [exiting, setExiting] = useState(false);
  const [phase, setPhase] = useState("converge");
  const [statusText, setStatusText] = useState("");
  const [displayStatus, setDisplayStatus] = useState("");
  const startRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Cipher-decode effect for the status text
  useEffect(() => {
    if (!statusText) {
      setDisplayStatus("");
      return;
    }
    const chars = "01!@#$%&ABCDEF";
    let resolveIdx = 0;
    const interval = setInterval(() => {
      if (resolveIdx > statusText.length) {
        clearInterval(interval);
        return;
      }
      setDisplayStatus(
        statusText
          .split("")
          .map((c, i) => {
            if (c === " ") return " ";
            if (i < resolveIdx) return c;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      resolveIdx++;
    }, 30);
    return () => clearInterval(interval);
  }, [statusText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    let w, h, frame;

    const PARTICLE_COUNT = 1500;
    const particles = [];

    // Cyberpunk color palette
    const colors = [
      { r: 0, g: 255, b: 65 }, // Matrix Green
      { r: 0, g: 255, b: 200 }, // Cyan
      { r: 255, g: 0, b: 85 }, // Magenta
      { r: 255, g: 255, b: 255 }, // White
      { r: 200, g: 255, b: 0 }, // Yellow
    ];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Define crisp concentric rings for the target shape
    const rings = [
      { count: 100, radius: 25 },
      { count: 250, radius: 55 },
      { count: 400, radius: 85 },
      { count: 750, radius: 120 },
    ];

    let pIdx = 0;
    for (let r = 0; r < rings.length; r++) {
      const ring = rings[r];
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2 + Math.random() * 0.1;
        // Start position scattered far outside
        const startDist = Math.max(w, h) * (0.6 + Math.random() * 0.5);
        const startAngle = Math.random() * Math.PI * 2;

        particles.push({
          x: w / 2 + Math.cos(startAngle) * startDist,
          y: h / 2 + Math.sin(startAngle) * startDist,
          tx: w / 2 + Math.cos(angle) * ring.radius,
          ty: h / 2 + Math.sin(angle) * ring.radius,
          radius: ring.radius, // Store radius for orbiting
          angle: angle, // Store base angle for orbiting
          vx: 0,
          vy: 0,
          size: Math.random() * 2 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          char: Math.random() > 0.5 ? "1" : "0",
          isText: Math.random() > 0.75,
          speed: Math.random() * 0.04 + 0.02,
          glitchOffset: 0,
          shatterVx: 0,
          shatterVy: 0,
          shattered: false,
        });
        pIdx++;
      }
    }

    startRef.current = performance.now();
    let currentPhase = "converge";

    const draw = (now) => {
      frame = requestAnimationFrame(draw);
      const elapsed = (now - startRef.current) / 1000;

      // === PHASE MANAGEMENT ===
      if (currentPhase === "converge") {
        if (elapsed > 0.1 && !statusText) setStatusText("COMPILING KERNEL...");
        if (elapsed > 1.2 && statusText === "COMPILING KERNEL...") setStatusText("INJECTING NEURAL TOKENS...");
        if (elapsed > 2.8) {
          currentPhase = "pulse";
          setPhase("pulse");
          setStatusText("SYSTEM LINK ESTABLISHED");
        }
      }
      if (currentPhase === "pulse" && elapsed > 4.8) {
        currentPhase = "shatter";
        setPhase("shatter");
        setStatusText("ACCESS GRANTED");
        // Blast outward
        particles.forEach((p) => {
          const angle = Math.atan2(p.y - h / 2, p.x - w / 2) + (Math.random() - 0.5) * 0.5;
          const force = Math.random() * 35 + 15;
          p.shatterVx = Math.cos(angle) * force;
          p.shatterVy = Math.sin(angle) * force;
          p.shattered = true;
        });
      }
      if (currentPhase === "shatter" && elapsed > 6.0) {
        currentPhase = "exit";
        setExiting(true);
        setTimeout(() => onCompleteRef.current?.(), 800);
      }

      // === BACKGROUND & CLEAR ===
      ctx.fillStyle = currentPhase === "shatter" && elapsed < 4.95
        ? "rgba(255, 255, 255, 0.9)" // Bright flash on shatter
        : "rgba(5, 5, 5, 0.35)"; // Motion blur trail
      ctx.fillRect(0, 0, w, h);

      // Global Glitch Intensity (screen shake)
      let globalGlitch = 0;
      if (currentPhase === "converge" && elapsed < 2.5) {
        globalGlitch = Math.random() > 0.85 ? (Math.random() - 0.5) * 30 : 0;
      } else if (currentPhase === "pulse") {
        globalGlitch = Math.random() > 0.95 ? (Math.random() - 0.5) * 60 : 0;
      }

      ctx.save();
      if (Math.abs(globalGlitch) > 15) {
        ctx.translate(globalGlitch, Math.random() > 0.5 ? (Math.random() - 0.5) * 10 : 0);
      }

      // Add a large central radial glow during pulse
      if (currentPhase === "pulse") {
        const glowPulse = Math.abs(Math.sin(elapsed * 5));
        const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 200);
        gradient.addColorStop(0, `rgba(0, 255, 200, ${glowPulse * 0.15})`);
        gradient.addColorStop(0.5, `rgba(255, 0, 85, ${glowPulse * 0.08})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      // === RENDER PARTICLES ===
      ctx.globalCompositeOperation = "screen";
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        let alpha = 1;
        let blur = 0;

        if (currentPhase === "converge") {
          // Smooth ease-out convergence
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          p.x += dx * p.speed;
          p.y += dy * p.speed;

          // Occasional individual glitch offset
          if (Math.random() > 0.98) {
            p.glitchOffset = (Math.random() - 0.5) * 80;
          } else {
            p.glitchOffset *= 0.6; // snap back quickly
          }
        } else if (currentPhase === "pulse") {
          // Locked into rings, orbiting smoothly
          p.angle += 0.015; // Orbit speed
          p.x = w / 2 + Math.cos(p.angle) * p.radius;
          p.y = h / 2 + Math.sin(p.angle) * p.radius;

          // Occasionally a particle jumps to the center and back
          if (Math.random() > 0.995) {
            p.x = w / 2 + (Math.random() - 0.5) * 50;
            p.y = h / 2 + (Math.random() - 0.5) * 50;
          }
          p.glitchOffset = 0;

          // Oscillating brightness/glow
          const glowIntensity = Math.abs(Math.sin(elapsed * 5));
          alpha = 0.4 + glowIntensity * 0.6;
          blur = Math.random() > 0.8 ? glowIntensity * 12 : 0; // Only blur 20% to save performance
        } else if (currentPhase === "shatter" && p.shattered) {
          p.x += p.shatterVx;
          p.y += p.shatterVy;
          p.shatterVx *= 0.97;
          p.shatterVy *= 0.97;
          p.size *= 0.96;
          alpha = Math.max(0, p.size / 3);
        }

        if (p.size < 0.5 || alpha < 0.05) continue;

        const drawX = p.x + p.glitchOffset;
        const drawY = p.y;

        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
        ctx.shadowBlur = blur;
        if (blur > 0) ctx.shadowColor = ctx.fillStyle;

        if (p.isText) {
          if (Math.random() > 0.96) p.char = Math.random() > 0.5 ? "1" : "0";
          ctx.fillText(p.char, drawX, drawY);
        } else {
          ctx.fillRect(drawX - p.size / 2, drawY - p.size / 2, p.size, p.size);
        }
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;
      ctx.restore();

      // === DRAW CENTER TEXT ===
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const txtX = w / 2;
      const txtY = h / 2 + 180;

      // Heavy Chromatic Aberration
      const textGlitch = Math.random() > 0.9 ? (Math.random() - 0.5) * 15 : 0;

      // Red/Magenta layer
      ctx.fillStyle = "rgba(255, 0, 85, 0.8)";
      ctx.fillText(displayStatus, txtX - 3 + textGlitch, txtY);

      // Cyan layer
      ctx.fillStyle = "rgba(0, 255, 200, 0.8)";
      ctx.fillText(displayStatus, txtX + 3 - textGlitch, txtY);

      // Main white/green layer
      ctx.fillStyle = currentPhase === "shatter" ? "#00ff41" : "rgba(255, 255, 255, 0.95)";
      ctx.fillText(displayStatus, txtX + (Math.random() > 0.95 ? textGlitch * 2 : 0), txtY);

      // === RANDOM RGB GLITCH BARS ===
      if (Math.random() > 0.92 && currentPhase !== "shatter") {
        const gY = Math.random() * h;
        const gH = Math.random() * 40 + 10;
        const gW = Math.random() * w;
        const gColor = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = `rgba(${gColor.r}, ${gColor.g}, ${gColor.b}, 0.12)`;
        ctx.fillRect(Math.random() * w, gY, gW, gH);
      }
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#050505] transition-opacity duration-700 pointer-events-none ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Permanent CRT Overlay */}
      <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] mix-blend-overlay z-10" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)" }}
      />

      {/* Minimal HUD Corners */}
      <div className="absolute top-6 left-6 font-mono text-[10px] text-green-500/40 uppercase z-20 tracking-widest">
        SYS.INIT // <span className="text-pink-500/60">ROOT_ACCESS</span>
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[10px] text-cyan-500/40 uppercase z-20 tracking-widest text-right">
        MEMORY_DUMP: 0x<span className="animate-pulse text-white/50">F4B9</span>
      </div>
    </div>
  );
};

export default SiteLoader;
