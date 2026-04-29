"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ExternalLink,
  Terminal,
  Cpu,
  Database,
  Share2,
  Eye,
} from "lucide-react";

const PROJECTS = [
  {
    id: "PROJ_01",
    name: "NEBULA_CORE",
    category: "FRONTEND_ARCH",
    status: "STABLE",
    description:
      "High-performance neural interface for distributed cloud systems. Implements real-time data visualization with zero-latency synchronization.",
    tech: ["REACT", "THREE.JS", "WEBSOCKETS"],
    date: "2024.Q1",
    color: "#00ffc8",
  },
  {
    id: "PROJ_02",
    name: "VOID_ENCRYPTION",
    category: "CYBER_SEC",
    status: "ENCRYPTED",
    description:
      "End-to-end quantum-resistant encryption protocol designed for decentralized communication networks. Features automated threat detection.",
    tech: ["RUST", "WEBASSEMBLY", "P2P"],
    date: "2023.Q4",
    color: "#ff0040",
  },
  {
    id: "PROJ_03",
    name: "SYNTH_GENESIS",
    category: "AI_LOGIC",
    status: "EVOLVING",
    description:
      "Generative AI framework specialized in architectural synthesis. Translates conceptual sketches into optimized structural blueprints.",
    tech: ["PYTHON", "PYTORCH", "NEXT.JS"],
    date: "2024.Q2",
    color: "#00ff41",
  },
];

const DecryptText = ({ text, active }) => {
  const [display, setDisplay] = useState(text);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

  useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) return text[index];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join(""),
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 4;
    }, 50);

    return () => clearInterval(interval);
  }, [text, active]);

  return <span>{display}</span>;
};

const NeuralArchive = () => {
  const [selectedId, setSelectedId] = useState(PROJECTS[0].id);
  const selectedProject = PROJECTS.find((p) => p.id === selectedId);

  return (
    <section
      id="archive"
      className="relative min-h-screen w-full bg-black py-24 px-6 md:px-20 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[1px] border-green-500/10 rounded-full scale-[1.5]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[1px] border-green-500/5 rounded-full scale-[2]" />
      </div>

      <div className="max-w-7xl w-full z-10 flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-500/60 font-mono text-xs tracking-widest uppercase">
              <Terminal size={14} />
              <span>System.Access // Archive_01</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase italic">
              Neural{" "}
              <span className="text-green-500 glitch-name" data-text="Archive">
                Archive
              </span>
            </h2>
          </div>
          <div className="font-mono text-[10px] text-white/30 text-right space-y-1 uppercase tracking-widest">
            <div>Security_Level: 05_REDACTED</div>
            <div>Source: Local_Machine::882</div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
          {/* Sidebar: Project Directory */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="font-mono text-[10px] text-green-500/40 uppercase mb-2 tracking-[0.3em]">
              Directory Listing: /projects/
            </div>
            <div className="space-y-3">
              {PROJECTS.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedId(project.id)}
                  className={`w-full group relative flex items-center justify-between p-4 border transition-all duration-300 ${
                    selectedId === project.id
                      ? "bg-green-500/10 border-green-500/40 text-white translate-x-2"
                      : "bg-black/40 border-white/5 text-white/40 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  {/* Selection Indicator */}
                  {selectedId === project.id && (
                    <div className="absolute left-[-1px] top-0 bottom-0 w-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                  )}

                  <div className="flex flex-col items-start gap-1">
                    <span className="font-mono text-[9px] opacity-40">
                      {project.id}
                    </span>
                    <span className="font-mono text-sm tracking-widest font-bold">
                      {selectedId === project.id ? (
                        <DecryptText text={project.name} active={true} />
                      ) : (
                        project.name
                      )}
                    </span>
                  </div>

                  <div
                    className={`flex flex-col items-end gap-1 font-mono text-[9px] transition-opacity duration-300 ${selectedId === project.id ? "opacity-100" : "opacity-0"}`}
                  >
                    <span className="text-green-500">[ACCESS_GRANTED]</span>
                    <span className="opacity-40">{project.category}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* System Status Panel */}
            <div className="mt-auto p-4 border border-white/5 bg-white/[0.02] rounded-sm space-y-3">
              <div className="flex items-center justify-between font-mono text-[9px] text-white/20">
                <span>DATABASE_INTEGRITY</span>
                <span className="text-green-500">100%</span>
              </div>
              <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-green-500/30 w-3/4 animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
                <span className="font-mono text-[8px] text-green-500/50 uppercase tracking-widest">
                  Awaiting Command...
                </span>
              </div>
            </div>
          </div>

          {/* Main Display: Project Content */}
          <div className="lg:col-span-8 relative flex flex-col gap-6">
            {/* Holographic Frame */}
            <div className="relative flex-1 border border-white/10 bg-black/40 rounded-lg overflow-hidden group">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-green-500/20" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-green-500/20" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-1">
                    <div className="font-mono text-[10px] text-green-500/60 uppercase tracking-widest">
                      Metadata_File
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight italic">
                      {selectedProject.name}
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    <button className="p-2 border border-white/10 rounded-full text-white/40 hover:text-green-400 hover:border-green-400/30 transition-all duration-300">
                      <Share2 size={16} />
                    </button>
                    <button className="p-2 border border-white/10 rounded-full text-white/40 hover:text-green-400 hover:border-green-400/30 transition-all duration-300">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>

                {/* Main Display Area (Reserved for Image/Visual) */}
                <div className="flex-1 relative mb-8 flex items-center justify-center overflow-hidden bg-white/[0.01] border border-white/5 rounded">
                  {/* Scanlines Effect */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20 z-10"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)",
                    }}
                  />

                  {/* Glowing Core */}
                  <div
                    className="absolute w-64 h-64 rounded-full blur-[100px] opacity-20 animate-pulse"
                    style={{ backgroundColor: selectedProject.color }}
                  />

                  {/* Mock Visual representation */}
                  <div className="relative z-20 flex flex-col items-center gap-6">
                    <div className="relative">
                      <Cpu
                        size={80}
                        className="text-white/20 animate-spin-slow"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Database size={32} className="text-white/40" />
                      </div>
                    </div>
                    <div className="flex gap-10">
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-[8px] text-white/20">
                          LATENCY
                        </span>
                        <span className="font-mono text-sm text-green-500/60">
                          0.2ms
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-[8px] text-white/20">
                          THROUGHPUT
                        </span>
                        <span className="font-mono text-sm text-green-500/60">
                          8.4TB/s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description & Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                      Analysis_Log
                    </div>
                    <p className="text-sm text-white/60 font-mono leading-relaxed h-20 overflow-y-auto custom-scrollbar pr-4">
                      {selectedProject.description}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                      Tech_Stack
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tech.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-white/60 tracking-widest"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative scan beam */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent animate-hologram-scan pointer-events-none" />
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between px-2">
              <div className="flex gap-6 font-mono text-[9px] text-white/20">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span>STATUS: {selectedProject.status}</span>
                </div>
                <div>RELEASE_DATE: {selectedProject.date}</div>
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 font-mono text-[9px] text-white/40 hover:text-white transition-colors">
                  <Eye size={12} />
                  <span>VIEW_DETAILS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 65, 0.2);
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
};

export default NeuralArchive;
