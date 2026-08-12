import React from "react";

export interface GradientBlobCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const GradientBlobCard: React.FC<GradientBlobCardProps> = ({ children, className = "", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-red-900/30 bg-black/80 p-1 shadow-2xl backdrop-blur-xl">
        {/* Glassy Overlay Background */}
        <div className="absolute inset-[3px] z-10 rounded-[12px] bg-neutral-950/85 backdrop-blur-2xl border border-white/10" />

        {/* Animated Continuous Gradient Blob Background */}
        <div className="absolute -top-1/2 -left-1/2 z-0 h-[220px] w-[220px] rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-[#C1121F] opacity-90 blur-xl animate-blob" />

        {/* Card Interactive Content Container */}
        <div className="relative z-20 p-5">
          {children}
        </div>
      </div>

      {/* Embedded CSS Keyframes for Infinite Animation */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(-30%, -30%) rotate(0deg); }
          25% { transform: translate(30%, -20%) rotate(90deg); }
          50% { transform: translate(20%, 30%) rotate(180deg); }
          75% { transform: translate(-20%, 20%) rotate(270deg); }
          100% { transform: translate(-30%, -30%) rotate(360deg); }
        }
        .animate-blob {
          animation: blob 7s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default GradientBlobCard;
