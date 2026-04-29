"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";

// System warning messages that appear as damage increases
const WARNINGS = [
  {
    threshold: 3,
    text: "⚠ STRUCTURAL INTEGRITY COMPROMISED",
    color: "#00ff41",
  },
  { threshold: 6, text: "⚠ CONTAINMENT BREACH DETECTED", color: "#ffcc00" },
  { threshold: 10, text: "⚠ CRITICAL FAILURE IMMINENT", color: "#ff6600" },
  { threshold: 15, text: "☠ SYSTEM COLLAPSE — EVACUATE", color: "#ff0040" },
];

const CrackedGlass = () => {
  const containerRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const crackCanvasRef = useRef(null);
  const fxCanvasRef = useRef(null); // lightweight FX layer for transient effects
  const stateRef = useRef({
    cracks: [],
    impactPoints: [],
    totalCracks: 0,
    clickCount: 0,
    holdTimer: null,
    W: 0,
    H: 0,
    dirty: false,
    particles: [],
    debris: [], // impact debris particles
    shockwaves: [], // expanding rings
    dataLeaks: [], // floating hex text
    shakeUntil: 0,
    animFrame: null,
  });
  const [crackCount, setCrackCount] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);
  const [activeWarnings, setActiveWarnings] = useState([]);
  const [shakeClass, setShakeClass] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const alertTriggered = useRef(false);

  // Damage ratio for color shifting (0 = pristine, 1 = destroyed)
  const damageRatio = Math.min(crackCount / 20, 1);

  const triggerShake = useCallback((intensity) => {
    const cls = intensity > 0.6 ? "shake-heavy" : "shake-light";
    setShakeClass(cls);
    setTimeout(() => setShakeClass(""), intensity > 0.6 ? 400 : 200);
  }, []);

  const addCrack = useCallback(
    (cx, cy, intensity) => {
      const s = stateRef.current;
      s.totalCracks++;
      setCrackCount(s.totalCracks);
      s.impactPoints.push({ x: cx, y: cy, t: Date.now(), intensity });
      s.dirty = true;

      // Trigger alert after 20 cracks
      if (s.totalCracks >= 20 && !alertTriggered.current) {
        setShowAlert(true);
        alertTriggered.current = true;
      }

      // Update warnings
      setActiveWarnings(WARNINGS.filter((w) => s.totalCracks >= w.threshold));

      // Screen shake
      triggerShake(intensity);

      // Spawn debris particles
      const debrisCount = Math.floor(6 + intensity * 12);
      for (let i = 0; i < debrisCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3 * intensity;
        s.debris.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.015 + Math.random() * 0.02,
          size: 1 + Math.random() * 2,
        });
      }

      // Spawn shockwave
      s.shockwaves.push({
        x: cx,
        y: cy,
        radius: 0,
        maxRadius: 40 + intensity * 80,
        life: 1,
      });

      // Spawn data leak text
      if (Math.random() < 0.6) {
        const hexChars = "0123456789ABCDEF";
        let txt = "0x";
        for (let i = 0; i < 8; i++)
          txt += hexChars[Math.floor(Math.random() * 16)];
        s.dataLeaks.push({
          x: cx + (Math.random() - 0.5) * 40,
          y: cy,
          text: txt,
          life: 1,
          vy: -0.3 - Math.random() * 0.5,
        });
      }

      // --- REALISTIC CRACK GENERATION ---
      const numArms = Math.floor(5 + intensity * 8);
      const maxDepth = Math.floor(3 + intensity * 4);

      function grow(x, y, angle, length, depth, alpha, widthFactor) {
        if (depth <= 0 || length < 2) return;

        // Organic curvature — compute a bezier control point offset perpendicular to direction
        const curvature = (Math.random() - 0.5) * length * 0.4;
        const perpAngle = angle + Math.PI * 0.5;
        const cpx =
          (x + x + Math.cos(angle) * length) / 2 +
          Math.cos(perpAngle) * curvature;
        const cpy =
          (y + y + Math.sin(angle) * length) / 2 +
          Math.sin(perpAngle) * curvature;

        // End point with micro-jitter
        const endJitter = length * 0.08;
        const nx2 =
          x + Math.cos(angle) * length + (Math.random() - 0.5) * endJitter;
        const ny2 =
          y + Math.sin(angle) * length + (Math.random() - 0.5) * endJitter;

        // Width tapers as depth decreases (thinner at tips)
        const w = widthFactor * (depth / maxDepth);

        s.cracks.push({
          x1: x,
          y1: y,
          x2: nx2,
          y2: ny2,
          cpx,
          cpy, // bezier control point
          depth,
          alpha,
          width: w,
          isMicro: false,
        });

        // Micro-fractures — tiny hairlines that sprout off the main crack
        if (depth > 1 && Math.random() < 0.5) {
          const microAngle =
            angle +
            (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.8);
          const microLen = length * (0.1 + Math.random() * 0.15);
          const mx = nx2 + Math.cos(microAngle) * microLen;
          const my = ny2 + Math.sin(microAngle) * microLen;
          s.cracks.push({
            x1: nx2,
            y1: ny2,
            x2: mx,
            y2: my,
            cpx: (nx2 + mx) / 2 + (Math.random() - 0.5) * 3,
            cpy: (ny2 + my) / 2 + (Math.random() - 0.5) * 3,
            depth: 1,
            alpha: alpha * 0.3,
            width: 0.2,
            isMicro: true,
          });
        }

        // Branching — more aggressive at higher depths
        const branches =
          depth > maxDepth * 0.5
            ? Math.floor(1 + Math.random() * 2)
            : Math.random() < 0.4
              ? 1
              : 0;

        for (let b = 0; b < branches; b++) {
          const branchAngle = angle + (Math.random() - 0.5) * Math.PI * 0.55;
          const branchLen = length * (0.3 + Math.random() * 0.35);
          grow(
            nx2,
            ny2,
            branchAngle,
            branchLen,
            depth - 1,
            alpha * 0.65,
            widthFactor * 0.7,
          );
        }

        // Main continuation — slight wander
        const contAngle = angle + (Math.random() - 0.5) * 0.3;
        const contLen = length * (0.5 + Math.random() * 0.3);
        grow(
          nx2,
          ny2,
          contAngle,
          contLen,
          depth - 1,
          alpha * 0.85,
          widthFactor * 0.85,
        );
      }

      const baseLen = 35 + intensity * 120;
      for (let i = 0; i < numArms; i++) {
        const angle = (i / numArms) * Math.PI * 2 + Math.random() * 0.4;
        grow(
          cx,
          cy,
          angle,
          baseLen * (0.6 + Math.random() * 0.6),
          maxDepth,
          1.0,
          1.0 + intensity * 0.5,
        );
      }

      // Concentric ring cracks (with bezier arcs)
      const rings = Math.floor(1 + intensity * 3);
      for (let r = 0; r < rings; r++) {
        const radius = 14 + r * (16 + intensity * 24);
        const segments = Math.floor(10 + r * 5);
        for (let seg = 0; seg < segments; seg++) {
          if (Math.random() < 0.15) continue;
          const a1 = (seg / segments) * Math.PI * 2;
          const a2 =
            ((seg + 0.7 + Math.random() * 0.2) / segments) * Math.PI * 2;
          const rj = (Math.random() - 0.5) * 8;
          const amid = (a1 + a2) / 2;
          // Control point slightly inward/outward for arc curvature
          const arcOffset = (Math.random() - 0.5) * 12;
          s.cracks.push({
            x1: cx + Math.cos(a1) * (radius + rj),
            y1: cy + Math.sin(a1) * (radius + rj),
            x2: cx + Math.cos(a2) * (radius + rj),
            y2: cy + Math.sin(a2) * (radius + rj),
            cpx: cx + Math.cos(amid) * (radius + rj + arcOffset),
            cpy: cy + Math.sin(amid) * (radius + rj + arcOffset),
            depth: 1,
            alpha: 0.45 - r * 0.07,
            width: 0.4,
            isMicro: false,
          });
        }
      }
    },
    [triggerShake],
  );

  const handleReset = useCallback(() => {
    const s = stateRef.current;
    s.cracks = [];
    s.impactPoints = [];
    s.debris = [];
    s.shockwaves = [];
    s.dataLeaks = [];
    s.totalCracks = 0;
    s.clickCount = 0;
    s.dirty = true;
    setCrackCount(0);
    setHintVisible(true);
    setActiveWarnings([]);
    setShowAlert(false);
    alertTriggered.current = false;
    const ctx = crackCanvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, s.W, s.H);
    const fxCtx = fxCanvasRef.current?.getContext("2d");
    if (fxCtx) fxCtx.clearRect(0, 0, s.W, s.H);
    setTimeout(() => {
      addCrack(
        s.W * 0.5 + (Math.random() - 0.5) * 80,
        s.H * 0.45 + (Math.random() - 0.5) * 60,
        0.4,
      );
    }, 200);
  }, [addCrack]);

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const crackCanvas = crackCanvasRef.current;
    const fxCanvas = fxCanvasRef.current;
    if (!bgCanvas || !crackCanvas || !fxCanvas) return;

    const s = stateRef.current;
    const bgCtx = bgCanvas.getContext("2d");
    const crackCtx = crackCanvas.getContext("2d");
    const fxCtx = fxCanvas.getContext("2d");

    const initParticles = () => {
      s.particles = [];
      for (let i = 0; i < 100; i++) {
        s.particles.push({
          x: Math.random() * s.W,
          y: Math.random() * s.H,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          size: 0.5 + Math.random() * 1.5,
          alpha: 0.08 + Math.random() * 0.2,
        });
      }
    };

    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      s.W = rect.width;
      s.H = rect.height;
      bgCanvas.width = crackCanvas.width = fxCanvas.width = s.W;
      bgCanvas.height = crackCanvas.height = fxCanvas.height = s.H;
      initParticles();
      s.dirty = true;
    };

    resize();
    window.addEventListener("resize", resize);

    setTimeout(() => {
      addCrack(
        s.W * 0.5 + (Math.random() - 0.5) * 80,
        s.H * 0.45 + (Math.random() - 0.5) * 60,
        0.4,
      );
    }, 600);

    // --- BG: ambient particles + grid ---
    const renderBg = () => {
      bgCtx.fillStyle = "#020408";
      bgCtx.fillRect(0, 0, s.W, s.H);

      // Grid — shifts color based on damage
      const r = Math.floor(damageRatio * 255);
      const g = Math.floor((1 - damageRatio * 0.7) * 255);
      bgCtx.strokeStyle = `rgba(${r}, ${g}, 65, 0.025)`;
      bgCtx.lineWidth = 0.5;
      bgCtx.beginPath();
      for (let x = 0; x < s.W; x += 60) {
        bgCtx.moveTo(x, 0);
        bgCtx.lineTo(x, s.H);
      }
      for (let y = 0; y < s.H; y += 60) {
        bgCtx.moveTo(0, y);
        bgCtx.lineTo(s.W, y);
      }
      bgCtx.stroke();

      for (const p of s.particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = s.W;
        if (p.x > s.W) p.x = 0;
        if (p.y < 0) p.y = s.H;
        if (p.y > s.H) p.y = 0;
        bgCtx.fillStyle = `rgba(0, 255, 100, ${p.alpha})`;
        bgCtx.fillRect(p.x, p.y, p.size, p.size);
      }
    };

    // --- CRACKS: only on dirty (realistic renderer) ---
    const renderCracks = () => {
      if (!s.dirty) return;
      s.dirty = false;
      crackCtx.clearRect(0, 0, s.W, s.H);

      // --- IMPACT CRATERS ---
      for (const pt of s.impactPoints) {
        // Outer halo
        const haloR = 18 + pt.intensity * 50;
        const halo = crackCtx.createRadialGradient(
          pt.x,
          pt.y,
          0,
          pt.x,
          pt.y,
          haloR,
        );
        halo.addColorStop(0, "rgba(220,255,240,0.45)");
        halo.addColorStop(0.15, "rgba(100,255,180,0.2)");
        halo.addColorStop(0.5, "rgba(0,255,100,0.05)");
        halo.addColorStop(1, "rgba(0,30,15,0)");
        crackCtx.fillStyle = halo;
        crackCtx.beginPath();
        crackCtx.arc(pt.x, pt.y, haloR, 0, Math.PI * 2);
        crackCtx.fill();

        // Concentric stress rings
        for (let r = 1; r <= 3; r++) {
          const rr = 4 + r * (3 + pt.intensity * 5);
          crackCtx.beginPath();
          crackCtx.arc(pt.x, pt.y, rr, 0, Math.PI * 2);
          crackCtx.strokeStyle = `rgba(200,255,220,${0.25 - r * 0.06})`;
          crackCtx.lineWidth = 0.5;
          crackCtx.stroke();
        }

        // Shattered center — small radial lines
        const spokes = 6 + Math.floor(pt.intensity * 6);
        for (let i = 0; i < spokes; i++) {
          const a = (i / spokes) * Math.PI * 2 + Math.random() * 0.3;
          const len = 3 + Math.random() * 6 * pt.intensity;
          crackCtx.beginPath();
          crackCtx.moveTo(pt.x, pt.y);
          crackCtx.lineTo(pt.x + Math.cos(a) * len, pt.y + Math.sin(a) * len);
          crackCtx.strokeStyle = "rgba(255,255,255,0.5)";
          crackCtx.lineWidth = 0.6;
          crackCtx.stroke();
        }

        // Center bright point
        crackCtx.fillStyle = "rgba(255,255,255,0.7)";
        crackCtx.beginPath();
        crackCtx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
        crackCtx.fill();
      }

      crackCtx.lineCap = "round";
      crackCtx.lineJoin = "round";

      // --- LAYER 1: Outer glow (batched, bezier) ---
      crackCtx.beginPath();
      for (const c of s.cracks) {
        crackCtx.moveTo(c.x1, c.y1);
        if (c.cpx !== undefined)
          crackCtx.quadraticCurveTo(c.cpx, c.cpy, c.x2, c.y2);
        else crackCtx.lineTo(c.x2, c.y2);
      }
      const dr = damageRatio;
      crackCtx.strokeStyle = `rgba(${Math.floor(dr * 180)}, ${Math.floor(255 - dr * 160)}, 100, 0.06)`;
      crackCtx.lineWidth = 4;
      crackCtx.stroke();

      // --- LAYER 2: Variable-width mid crack (per-crack for width variation) ---
      for (const c of s.cracks) {
        crackCtx.beginPath();
        crackCtx.moveTo(c.x1, c.y1);
        if (c.cpx !== undefined)
          crackCtx.quadraticCurveTo(c.cpx, c.cpy, c.x2, c.y2);
        else crackCtx.lineTo(c.x2, c.y2);
        const a = c.alpha * (c.isMicro ? 0.15 : 0.35);
        crackCtx.strokeStyle = `rgba(200,255,235,${a})`;
        crackCtx.lineWidth = Math.max(0.3, (c.width || 0.5) * 1.2);
        crackCtx.stroke();
      }

      // --- LAYER 3: Core bright line (batched, bezier) ---
      crackCtx.beginPath();
      for (const c of s.cracks) {
        if (c.isMicro) continue;
        crackCtx.moveTo(c.x1, c.y1);
        if (c.cpx !== undefined)
          crackCtx.quadraticCurveTo(c.cpx, c.cpy, c.x2, c.y2);
        else crackCtx.lineTo(c.x2, c.y2);
      }
      crackCtx.strokeStyle = "rgba(255,255,255,0.65)";
      crackCtx.lineWidth = 0.35;
      crackCtx.stroke();

      // --- LAYER 4: Chromatic refraction edge (offset perpendicular, cyan tint) ---
      crackCtx.beginPath();
      for (const c of s.cracks) {
        if (c.isMicro || c.alpha < 0.3) continue;
        const dx = c.x2 - c.x1,
          dy = c.y2 - c.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) continue;
        const nx = (-dy / len) * 1.0,
          ny = (dx / len) * 1.0;
        crackCtx.moveTo(c.x1 + nx, c.y1 + ny);
        if (c.cpx !== undefined)
          crackCtx.quadraticCurveTo(
            c.cpx + nx,
            c.cpy + ny,
            c.x2 + nx,
            c.y2 + ny,
          );
        else crackCtx.lineTo(c.x2 + nx, c.y2 + ny);
      }
      crackCtx.strokeStyle = "rgba(0,255,200,0.1)";
      crackCtx.lineWidth = 0.3;
      crackCtx.stroke();
    };

    // --- FX: transient effects (debris, shockwaves, data leaks) ---
    const renderFx = () => {
      fxCtx.clearRect(0, 0, s.W, s.H);
      let hasActive = false;

      // Shockwaves
      for (let i = s.shockwaves.length - 1; i >= 0; i--) {
        const sw = s.shockwaves[i];
        sw.radius += 2.5;
        sw.life -= 0.025;
        if (sw.life <= 0) {
          s.shockwaves.splice(i, 1);
          continue;
        }
        hasActive = true;
        fxCtx.beginPath();
        fxCtx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        fxCtx.strokeStyle = `rgba(0, 255, 150, ${sw.life * 0.3})`;
        fxCtx.lineWidth = 1.5 * sw.life;
        fxCtx.stroke();
      }

      // Debris
      for (let i = s.debris.length - 1; i >= 0; i--) {
        const d = s.debris[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.03; // gravity
        d.life -= d.decay;
        if (d.life <= 0) {
          s.debris.splice(i, 1);
          continue;
        }
        hasActive = true;
        fxCtx.fillStyle = `rgba(200, 255, 220, ${d.life * 0.8})`;
        fxCtx.fillRect(d.x, d.y, d.size * d.life, d.size * d.life);
      }

      // Data leak text
      fxCtx.font = "9px 'Courier New', monospace";
      for (let i = s.dataLeaks.length - 1; i >= 0; i--) {
        const dl = s.dataLeaks[i];
        dl.y += dl.vy;
        dl.life -= 0.008;
        if (dl.life <= 0) {
          s.dataLeaks.splice(i, 1);
          continue;
        }
        hasActive = true;
        fxCtx.fillStyle = `rgba(0, 255, 100, ${dl.life * 0.5})`;
        fxCtx.fillText(dl.text, dl.x, dl.y);
      }

      return hasActive;
    };

    const loop = () => {
      renderBg();
      renderCracks();
      renderFx();
      s.animFrame = requestAnimationFrame(loop);
    };
    s.animFrame = requestAnimationFrame(loop);

    // --- EVENTS ---
    const getPos = (e) => {
      const rect = fxCanvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseDown = (e) => {
      const { x, y } = getPos(e);
      s.holdTimer = setTimeout(() => {
        for (let i = 0; i < 4; i++) {
          setTimeout(
            () =>
              addCrack(
                x + (Math.random() - 0.5) * 60,
                y + (Math.random() - 0.5) * 60,
                0.5 + Math.random() * 0.4,
              ),
            i * 100,
          );
        }
      }, 320);
    };
    const handleMouseUp = () => {
      if (s.holdTimer) clearTimeout(s.holdTimer);
      s.holdTimer = null;
    };
    const handleClick = (e) => {
      const { x, y } = getPos(e);
      s.clickCount++;
      if (s.clickCount > 3) setHintVisible(false);
      addCrack(x, y, 0.2 + Math.random() * 0.45);
    };
    const handleTouchStart = (e) => {
      e.preventDefault();
      const rect = fxCanvas.getBoundingClientRect();
      const t = e.touches[0];
      addCrack(
        t.clientX - rect.left,
        t.clientY - rect.top,
        0.35 + Math.random() * 0.4,
      );
    };
    const handleTouchMove = (e) => {
      e.preventDefault();
      if (Math.random() < 0.2) {
        const rect = fxCanvas.getBoundingClientRect();
        const t = e.touches[0];
        addCrack(
          t.clientX - rect.left,
          t.clientY - rect.top,
          0.1 + Math.random() * 0.2,
        );
      }
    };

    fxCanvas.addEventListener("mousedown", handleMouseDown);
    fxCanvas.addEventListener("mouseup", handleMouseUp);
    fxCanvas.addEventListener("mouseleave", handleMouseUp);
    fxCanvas.addEventListener("click", handleClick);
    fxCanvas.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    fxCanvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(s.animFrame);
      window.removeEventListener("resize", resize);
      fxCanvas.removeEventListener("mousedown", handleMouseDown);
      fxCanvas.removeEventListener("mouseup", handleMouseUp);
      fxCanvas.removeEventListener("mouseleave", handleMouseUp);
      fxCanvas.removeEventListener("click", handleClick);
      fxCanvas.removeEventListener("touchstart", handleTouchStart);
      fxCanvas.removeEventListener("touchmove", handleTouchMove);
      if (s.holdTimer) clearTimeout(s.holdTimer);
    };
  }, [addCrack]);

  // Determine damage level for UI color shifting
  const uiColor =
    damageRatio < 0.3 ? "#00ff41" : damageRatio < 0.6 ? "#ffcc00" : "#ff0040";
  const borderColor =
    damageRatio < 0.3
      ? "border-green-500/20"
      : damageRatio < 0.6
        ? "border-yellow-500/20"
        : "border-red-500/20";

  return (
    <section
      id="fractured"
      className="relative w-full bg-black overflow-hidden"
      style={{ height: "100vh" }}
    >
      <div
        ref={containerRef}
        className={`relative w-full h-full ${shakeClass}`}
        style={{ cursor: "crosshair" }}
      >
        <canvas
          ref={bgCanvasRef}
          className="absolute top-0 left-0 block w-full h-full"
        />
        <canvas
          ref={crackCanvasRef}
          className="absolute top-0 left-0 block w-full h-full"
        />
        <canvas
          ref={fxCanvasRef}
          className="absolute top-0 left-0 block w-full h-full"
        />

        {/* CSS scanlines + vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 3px)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Damage border flash */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            boxShadow:
              damageRatio > 0.5
                ? `inset 0 0 ${60 + damageRatio * 60}px rgba(255, 0, 64, ${damageRatio * 0.15})`
                : "none",
          }}
        />

        {/* HUD Corners — color shifts with damage */}
        <div
          className={`absolute top-4 left-4 w-10 h-10 border-l-2 border-t-2 ${borderColor} pointer-events-none transition-colors duration-700`}
        />
        <div
          className={`absolute top-4 right-4 w-10 h-10 border-r-2 border-t-2 ${borderColor} pointer-events-none transition-colors duration-700`}
        />
        <div
          className={`absolute bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 ${borderColor} pointer-events-none transition-colors duration-700`}
        />
        <div
          className={`absolute bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 ${borderColor} pointer-events-none transition-colors duration-700`}
        />

        {/* Section Header */}
        <div className="absolute top-8 left-16 z-20 pointer-events-none">
          <div
            className="flex items-center gap-2 font-mono text-[10px] tracking-[0.4em] uppercase mb-2 transition-colors duration-700"
            style={{ color: `${uiColor}66` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: `${uiColor}99` }}
            />
            <span>
              SYS.BREACH_PROTOCOL // {damageRatio < 0.5 ? "ACTIVE" : "CRITICAL"}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white/90 uppercase italic">
            Fractured{" "}
            <span
              className="glitch-name transition-colors duration-700"
              data-text="Void"
              style={{ color: uiColor }}
            >
              Void
            </span>
          </h2>
          <p className="font-mono text-[11px] text-white/20 mt-3 max-w-md leading-relaxed tracking-wide">
            Every system has a breaking point. Click to introduce structural
            failure. Hold to shatter.
          </p>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="absolute top-8 right-16 z-20 bg-white/[0.04] border border-white/10 text-white/30 font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-2 cursor-pointer hover:bg-white/10 hover:text-white/70 hover:border-green-500/30 transition-all duration-300"
        >
          SYS.RESET
        </button>

        {/* Crack Counter + Integrity Bar */}
        <div className="absolute top-20 right-16 z-20 pointer-events-none space-y-2">
          <div
            className="font-mono text-[9px] tracking-[0.3em] uppercase transition-colors duration-700"
            style={{ color: `${uiColor}44` }}
          >
            FRACTURES: {crackCount}
          </div>
          <div className="w-32 h-1 bg-white/5 overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${Math.max(0, 100 - damageRatio * 100)}%`,
                backgroundColor: uiColor,
                opacity: 0.4,
              }}
            />
          </div>
          <div className="font-mono text-[8px] tracking-[0.2em] text-white/15 uppercase">
            INTEGRITY: {Math.max(0, Math.round(100 - damageRatio * 100))}%
          </div>
        </div>

        {/* System Warnings */}
        <div className="absolute bottom-20 left-16 z-20 pointer-events-none space-y-2">
          {activeWarnings.map((w, i) => (
            <div
              key={i}
              className="font-mono text-[10px] tracking-[0.15em] uppercase animate-pulse"
              style={{
                color: w.color,
                opacity: 0.7,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              {w.text}
            </div>
          ))}
        </div>

        {/* Hint */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 font-mono text-[10px] tracking-[0.3em] text-white/25 uppercase whitespace-nowrap pointer-events-none transition-opacity duration-1000"
          style={{ opacity: hintVisible ? 1 : 0 }}
        >
          Click to crack &nbsp;·&nbsp; Hold to shatter
        </div>

        {/* Futuristic Alert Popup */}
        {showAlert && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-500">
            <div className="relative w-full max-w-md border border-red-500/30 bg-black/80 p-8 shadow-[0_0_50px_rgba(255,0,0,0.2)] overflow-hidden">
              {/* Animated scanning line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/50 shadow-[0_0_10px_rgba(255,0,0,0.5)] animate-hologram-scan" />

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500/50" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500/50" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500/50" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500/50" />

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full border-2 border-red-500/50 flex items-center justify-center animate-pulse">
                  <span className="text-red-500 text-2xl font-bold">!</span>
                </div>

                <div className="space-y-2">
                  <h3
                    className="text-2xl font-bold tracking-tighter text-red-500 uppercase italic glitch-name"
                    data-text="SYSTEM COLLAPSE"
                  >
                    SYSTEM COLLAPSE
                  </h3>
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                </div>

                <p className="font-mono text-[11px] text-white/60 leading-relaxed tracking-wider">
                  CRITICAL ARCHITECTURAL FAILURE DETECTED. NEURAL LINK INTEGRITY
                  AT 0%.
                  <br />
                  <br />
                  <span className="text-red-500/80">
                    ERROR_CODE: VOID_FRACTURE_RECURSION
                  </span>
                  <br />
                  PLEASE INITIATE EMERGENCY OVERRIDE.
                </p>

                <button
                  onClick={() => setShowAlert(false)}
                  className="w-full py-3 bg-red-500/10 border border-red-500/40 text-red-500 font-mono text-[10px] tracking-[0.3em] uppercase hover:bg-red-500 hover:text-black transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10">EMERGENCY_OVERRIDE</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .shake-light {
          animation: shake-sm 0.2s steps(4) forwards;
        }
        .shake-heavy {
          animation: shake-lg 0.4s steps(6) forwards;
        }
        @keyframes shake-sm {
          0%,
          100% {
            transform: translate(0);
          }
          25% {
            transform: translate(-2px, 1px);
          }
          50% {
            transform: translate(2px, -1px);
          }
          75% {
            transform: translate(-1px, -1px);
          }
        }
        @keyframes shake-lg {
          0%,
          100% {
            transform: translate(0);
          }
          10% {
            transform: translate(-4px, 2px) skewX(-0.5deg);
          }
          30% {
            transform: translate(3px, -3px) skewX(0.3deg);
          }
          50% {
            transform: translate(-3px, 1px);
          }
          75% {
            transform: translate(4px, -2px) skewX(-0.2deg);
          }
          90% {
            transform: translate(-1px, 2px);
          }
        }
        .fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .zoom-in {
          animation: zoom-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoom-in {
          from {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
};

export default CrackedGlass;
