import React, { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";

export interface MythCardProps {
  id: number;
  mythTitle: string;
  mythDesc: string;
  realityTitle: string;
  realityDesc: string;
}

const MythFlipCard: React.FC<MythCardProps> = ({
  mythTitle,
  mythDesc,
  realityTitle,
  realityDesc,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className="h-[260px] w-full [perspective:1000px] cursor-pointer" onClick={toggleFlip}>
      <div
        className={`relative h-full w-full rounded-2xl transition-all duration-700 [transform-style:preserve-3d] ${
          isFlipped
            ? "[transform:rotateY(180deg)_translateY(-6px)]"
            : "[transform:rotateY(0deg)_translateY(0px)]"
        }`}
      >
        {/* FRONT SIDE: MYTH - Dark Crimson Gradient Background */}
        <div 
          className={`absolute inset-0 flex flex-col justify-between rounded-2xl border border-red-950/40 p-5 shadow-xl transition-shadow duration-300 hover:shadow-red-950/30 overflow-hidden [backface-visibility:hidden] ${
            isFlipped ? "pointer-events-none" : "pointer-events-auto"
          }`}
          style={{
            background: "linear-gradient(135deg, rgb(26, 3, 5) 0%, rgb(45, 5, 9) 50%, rgb(143, 13, 23) 100%)"
          }}
        >
          {/* Ambient Radial Glow Effect matching Footer */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              background: "radial-gradient(60% 80%, rgba(193, 18, 31, 0.25) 0%, transparent 70%)"
            }} 
          />

          <div className="relative z-10 text-left">
            <div className="inline-block rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 border border-white/20 mb-3 uppercase tracking-widest">
              MYTH
            </div>
            <h4 className="text-base font-bold text-white leading-snug">
              {mythTitle}
            </h4>
            <p className="mt-2 text-xs text-white/70 line-clamp-3 leading-relaxed">
              {mythDesc}
            </p>
          </div>

          {/* Button styling */}
          <div className="relative z-10 flex items-center justify-end pt-2 border-t border-white/10 text-left">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFlip();
              }} 
              className="group flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white transition-colors"
            >
              <span className="font-sans">Click for reality</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 group-hover:bg-white/25 border border-white/20 transition-all">
                <ArrowRight className="h-3.5 w-3.5 text-white"/>
              </div>
            </button>
          </div>
        </div>

        {/* BACK SIDE: REALITY */}
        <div className={`absolute inset-0 flex flex-col justify-between rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-2xl backdrop-blur-md [transform:rotateY(180deg)] [backface-visibility:hidden] ${
          isFlipped ? "pointer-events-auto" : "pointer-events-none"
        }`}>
          <div>
            <div className="inline-block rounded-md bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-[#166534] border border-emerald-500/20 mb-3 uppercase tracking-widest">
              REALITY
            </div>
            <h4 className="text-base font-bold text-[#171717] leading-snug">
              {realityTitle}
            </h4>
            <p className="mt-2 text-xs text-[#969696] line-clamp-3 leading-relaxed">
              {realityDesc}
            </p>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-[#E8E8E8]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="group flex items-center gap-1.5 text-xs font-medium text-[#171717] hover:text-red-600 transition-colors"
            >
              <span className="font-sans">Flip back</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF7F7] border border-[#F0D9DC] group-hover:bg-[#C1121F] group-hover:border-red-900 transition-all">
                <RotateCcw className="h-3.5 w-3.5 text-[#C1121F] group-hover:text-white"/>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MythFlipCard;
