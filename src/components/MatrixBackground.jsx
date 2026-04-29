"use client";

import React, { useEffect, useRef } from "react";

const MatrixBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrame;
    let drops = [];
    let charGrid = [];

    const fontSize = 34;
    const columnWidth = 24;
    const rowHeight = 52; // 34px char + 18px gap
    const TRAIL_LENGTH = 6; // How many trailing characters per column
    const REVEAL_RADIUS = 360;

    const totalRows = () => Math.ceil(canvas.height / rowHeight) + TRAIL_LENGTH;
    const totalCols = () => Math.floor(canvas.width / columnWidth);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = totalCols();
      const rows = totalRows();
      drops = [];
      charGrid = [];
      for (let i = 0; i < cols; i++) {
        drops[i] = Math.random() * rows; // Float for smooth scrolling
        charGrid[i] = [];
        for (let j = 0; j < rows; j++) {
          charGrid[i][j] = Math.random() > 0.5 ? "1" : "0";
        }
      }
    };

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    resize();

    const draw = () => {
      animationFrame = requestAnimationFrame(draw);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isActive = mouseRef.current.active;

      // FULL clear every frame — no ghosting, no smearing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold ${fontSize}px "Courier New", monospace`;
      ctx.textBaseline = "top";

      const cols = totalCols();
      const rows = totalRows();

      for (let i = 0; i < cols; i++) {
        const headPos = drops[i]; // Float position
        const headRowIndex = Math.floor(headPos);

        // Draw the head + trailing characters explicitly
        for (let t = 0; t < TRAIL_LENGTH; t++) {
          const rowPos = headPos - t; // Smooth float Y
          const rowIndex = headRowIndex - t; // Integer index

          if (rowIndex < 0 || rowIndex >= rows) continue;

          const charX = i * columnWidth;
          const charY = rowPos * rowHeight;

          // Distance from this character to cursor
          const dx = charX + columnWidth / 2 - mx;
          const dy = charY + fontSize / 2 - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (!isActive || dist >= REVEAL_RADIUS) continue;

          // Proximity to cursor (0 = edge, 1 = dead center)
          const proximity = 1 - dist / REVEAL_RADIUS;
          // Trail fade (0 = tail, 1 = head)
          const trailFade = 1 - t / TRAIL_LENGTH;

          // Combined brightness
          const brightness = proximity * trailFade;
          if (brightness < 0.02) continue;

          // Color based on position in trail
          if (t === 0) {
            // HEAD — brightest, white-green
            ctx.fillStyle = `rgba(200, 255, 220, ${Math.min(1, brightness * 1.2)})`;
          } else if (t <= 2) {
            // Near head — bright green
            ctx.fillStyle = `rgba(0, 255, 65, ${Math.min(1, brightness * 0.9)})`;
          } else {
            // Tail — dim green
            ctx.fillStyle = `rgba(0, 100, 20, ${Math.min(1, brightness * 0.6)})`;
          }

          const safeIndex = ((rowIndex % rows) + rows) % rows;
          const char = charGrid[i][safeIndex];
          ctx.fillText(char, charX, charY);
        }

        // Smooth speed (pixels per frame)
        let speed = 0.04; // Slightly slower base

        // Distance to cursor for dynamic speed
        const dx = i * columnWidth + columnWidth / 2 - mx;
        const dy = headPos * rowHeight + fontSize / 2 - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (isActive && dist < REVEAL_RADIUS) {
          const intensity = 1 - dist / REVEAL_RADIUS;
          speed += intensity * 0.15; // Speed up near cursor
        }

        drops[i] += speed;

        // Randomly flip one character in the column for a classic matrix shimmer
        if (Math.random() > 0.8) {
          charGrid[i][Math.floor(Math.random() * rows)] =
            Math.random() > 0.5 ? "1" : "0";
        }

        // Reset when it's gone far enough off screen
        if (drops[i] > rows + TRAIL_LENGTH) {
          drops[i] = Math.random() * -TRAIL_LENGTH;
        }
      }
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-[-1] overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* CRT scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.015),rgba(0,0,255,0.04))] bg-[length:100%_3px,3px_100%]" />
    </div>
  );
};

export default MatrixBackground;
