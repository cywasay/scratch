"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SiteLoader = ({ onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("INITIALIZING...");
  const [isGlitchingExit, setIsGlitchingExit] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const jump = Math.random() > 0.8 ? Math.random() * 12 : Math.random() * 1.5;
        return Math.min(prev + jump, 100);
      });
    }, 60);

    const statusInterval = setInterval(() => {
      const statuses = [
        "BOOTING_KERNEL_v4.2.0...",
        "DECRYPTING_NEURAL_HASH...",
        "BYPASSING_SECURITY_LAYER...",
        "SYNCING_BIO_METRICS...",
        "STABILIZING_GRID...",
        "UPLINK_ESTABLISHED",
        "ACCESS_GRANTED"
      ];
      setStatus(statuses[Math.floor((progress / 100) * (statuses.length - 1))]);
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(statusInterval);
    };
  }, [progress]);

  useEffect(() => {
    if (progress === 100) {
      // Small pause at 100 before the violent exit
      setTimeout(() => {
        setIsGlitchingExit(true);
        setTimeout(() => {
          setLoading(false);
          onComplete();
        }, 800); // Duration of the violent glitch exit
      }, 500);
    }
  }, [progress, onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h;
    let frames = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const columns = Math.floor(w / 20);
    const drops = new Array(columns).fill(0);
    const chars = "0123456789ABCDEF!@#$%^&*()_+";

    const draw = () => {
      frames++;
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = "12px monospace";
      
      for (let i = 0; i < drops.length; i++) {
        if (Math.random() > 0.98) continue;
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 20;
        const y = drops[i] * 20;
        ctx.fillStyle = Math.random() > 0.9 ? "#fff" : "#00ff41";
        ctx.fillText(text, x, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }

      const centerX = w / 2;
      const centerY = h / 2;
      const radius = 150 + Math.sin(frames * 0.1) * 10;
      ctx.strokeStyle = "rgba(0, 255, 65, 0.2)";
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(frames * 0.02);
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        ctx.lineTo(radius * 0.86, radius * 0.5);
        ctx.lineTo(-radius * 0.86, radius * 0.5);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      const scanY = (frames * 5) % h;
      ctx.fillStyle = "rgba(0, 255, 65, 0.05)";
      ctx.fillRect(0, scanY, w, 2);

      requestAnimationFrame(draw);
    };

    const animationFrame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={isGlitchingExit ? {
            x: [0, -20, 20, -10, 10, 0],
            y: [0, 10, -10, 5, -5, 0],
            skewX: [0, 20, -20, 10, -10, 0],
            filter: ["brightness(1) contrast(1)", "brightness(5) contrast(2)", "brightness(1) contrast(5)", "brightness(10) contrast(1)"],
            scale: [1, 1.1, 0.9, 1.2, 0],
          } : {}}
          exit={{ opacity: 0 }}
          transition={isGlitchingExit ? { duration: 0.8, ease: "easeInOut", times: [0, 0.1, 0.2, 0.3, 0.4, 1] } : {}}
          className="fixed inset-0 z-[9999] bg-black overflow-hidden font-mono flex flex-col items-center justify-center"
        >
          {/* Intense Glitch Tearing Overlays (Only active on exit) */}
          {isGlitchingExit && (
            <div className="absolute inset-0 z-50 pointer-events-none">
              <motion.div 
                animate={{ top: ["20%", "80%", "40%"], opacity: [0, 1, 0] }}
                className="absolute left-0 w-full h-1 bg-white shadow-[0_0_20px_white]" 
              />
              <motion.div 
                animate={{ top: ["60%", "10%", "90%"], opacity: [0, 1, 0] }}
                className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_cyan]" 
              />
              <div className="absolute inset-0 bg-red-500/10 mix-blend-multiply animate-pulse" />
            </div>
          )}

          <canvas ref={canvasRef} className="absolute inset-0 opacity-20" />

          {/* CRT Overlay */}
          <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex flex-col items-center mb-12">
              <motion.div 
                animate={{ 
                  opacity: isGlitchingExit ? [1, 0, 1, 0, 1] : [1, 0.5, 1],
                  scale: isGlitchingExit ? [1, 1.5, 0.8, 1.2, 1] : [1, 1.02, 1] 
                }}
                transition={{ duration: isGlitchingExit ? 0.2 : 0.05, repeat: isGlitchingExit ? 4 : Infinity }}
                className="text-8xl font-black text-white tracking-tighter"
                style={{ textShadow: "0 0 20px rgba(0,255,65,0.5)" }}
              >
                {Math.floor(progress)}
                <span className="text-4xl opacity-50">%</span>
              </motion.div>
              <div className="h-1 w-48 bg-green-950 mt-4 overflow-hidden relative border border-green-500/20">
                <motion.div 
                  className="absolute inset-0 bg-green-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="w-[400px] bg-green-950/10 border border-green-500/20 p-6 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-green-500" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-green-500" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-green-500" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-green-500" />

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] text-green-500/40 uppercase tracking-widest mb-4">
                  <span>System_Manifest</span>
                  <span>v.882-AG</span>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="w-2 h-2 bg-green-500 animate-pulse shadow-[0_0_8px_#00ff41]" />
                  <span className="text-[12px] text-white font-bold tracking-widest uppercase">
                    {status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-2 pt-4 border-t border-green-500/10 text-[9px] text-green-500/60 uppercase">
                  <span>Memory_Buffer</span>
                  <span className="text-right text-white">0xFA22_Secure</span>
                  <span>CPU_Cycles</span>
                  <span className="text-right text-white">{Math.floor(progress * 123.4)}MHz</span>
                  <span>Network_Latency</span>
                  <span className="text-right text-green-400">0.02ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Technical Metadata */}
          <div className="fixed bottom-10 left-10 right-10 flex justify-between items-end z-10 pointer-events-none">
            <div className="flex flex-col gap-2">
              <div className="flex gap-1">
                {[...Array(20)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.1, 1, 0.1] }}
                    transition={{ duration: Math.random() + 0.5, repeat: Infinity, delay: i * 0.05 }}
                    className={`w-1 h-4 ${i < (progress / 5) ? "bg-green-500" : "bg-green-950"}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-green-500/30 uppercase tracking-[0.5em]">Neural_Link_Authorization_Pending</span>
            </div>
            
            <div className="text-right flex flex-col gap-1">
              <span className="text-[10px] text-green-500/40 uppercase tracking-widest font-bold">Enc_Type: AES-256-GCM</span>
              <span className="text-[9px] text-white/10 uppercase tracking-widest">© 2026 ANTIGRAVITY_SYSTEMS</span>
            </div>
          </div>

          {/* Global Vignette */}
          <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_200px_rgba(0,0,0,1)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SiteLoader;
