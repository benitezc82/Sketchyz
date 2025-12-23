import React from 'react';
import { Sparkles, Star, Pencil } from 'lucide-react';

interface LoadingProps {
  message: string;
}

export const Loading: React.FC<LoadingProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] p-10 text-center animate-fadeIn relative overflow-hidden">

      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#4DE1C1]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FF66C4]/10 rounded-full blur-2xl animate-bounce delay-700"></div>

      <div className="relative mb-12">
        {/* Main Icon Container */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 bg-[#FFD93D] rounded-3xl hand-border hand-shadow flex items-center justify-center z-10 transform -rotate-3 overflow-hidden">

          {/* Animated Pencil */}
          <div className="relative animate-wiggle-slow">
            <div className="relative transform rotate-[15deg]">
              {/* Simplified Pencil for Icon */}
              <div className="w-10 h-28 flex flex-col drop-shadow-lg relative">
                {/* Eraser */}
                <div className="h-[15%] w-full bg-[#FF66C4] rounded-t-lg border-[3px] border-[#1a1a1a] border-b-0"></div>
                {/* Metal */}
                <div className="h-[10%] w-full bg-gray-300 border-[3px] border-[#1a1a1a] border-b-0 flex justify-center gap-[2px]">
                  <div className="w-[2px] h-full bg-black/10"></div>
                  <div className="w-[2px] h-full bg-black/10"></div>
                </div>
                {/* Body */}
                <div className="h-[55%] w-full bg-[#4DE1C1] border-[3px] border-[#1a1a1a] border-b-0 flex justify-center">
                  <div className="w-[30%] h-full border-x-[2px] border-black/5"></div>
                </div>
                {/* Tip Container - Sharp! */}
                <div className="h-[20%] w-full relative flex justify-center">
                  {/* 1. Outline (Calculated for w-10 = 40px width -> 20px borders) */}
                  <div className="absolute top-0 border-l-[20px] border-r-[20px] border-t-[24px] border-l-transparent border-r-transparent border-t-[#1a1a1a]"></div>
                  {/* 2. Wood Fill */}
                  <div className="absolute top-0 border-l-[17px] border-r-[17px] border-t-[21px] border-l-transparent border-r-transparent border-t-[#FFD93D]"></div>
                  {/* 3. Graphite */}
                  <div className="absolute top-[14px] border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#1a1a1a]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sparkle Decoration inside box */}
          <Sparkles className="absolute top-2 right-2 text-white/50" size={24} />
        </div>

        {/* Orbiting Sparkles */}
        <div className="absolute -top-6 -right-6 animate-bounce delay-150">
          <Star fill="#FF66C4" className="text-[#1a1a1a]" size={32} strokeWidth={2.5} />
        </div>
        <div className="absolute -bottom-4 -left-6 animate-pulse delay-500">
          <Sparkles fill="#4DE1C1" className="text-[#1a1a1a]" size={40} strokeWidth={2.5} />
        </div>
      </div>

      {/* Text Content */}
      <h2 className="text-4xl font-black text-[#1a1a1a] mb-4 z-10 font-logo lowercase tracking-tight">
        magic happening...
      </h2>

      <div className="relative z-10">
        <div className="bg-white px-8 py-4 rounded-2xl hand-border hand-shadow-sm transform rotate-1 inline-block max-w-sm">
          <p className="text-xl md:text-2xl font-bold text-[#1a1a1a] leading-tight italic">
            "{message}"
          </p>
        </div>
      </div>

      {/* Bottom Hint */}

    </div>
  );
};
