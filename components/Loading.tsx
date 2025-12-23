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
        <div className="relative w-32 h-32 md:w-40 md:h-40 bg-[#7C3AED] rounded-3xl hand-border hand-shadow flex items-center justify-center z-10 transform -rotate-3 overflow-hidden">

          {/* Animated Pencil */}
          <div className="relative animate-wiggle-slow">
            <div className="relative transform rotate-[15deg]">
              {/* Welcome Screen Pencil (Scaled) */}
              <div className="relative w-14 h-36 transform scale-90 rotate-[15deg] drop-shadow-xl">
                <div className="h-[15%] w-full bg-[#FF66C4] rounded-t-xl border-4 border-black border-b-0"></div>
                <div className="h-[10%] w-full bg-gray-300 border-4 border-black border-b-0 flex gap-1 justify-center items-center">
                  <div className="w-1 h-full bg-black/10"></div>
                  <div className="w-1 h-full bg-black/10"></div>
                </div>
                <div className="h-[55%] w-full bg-[#4DE1C1] border-4 border-black border-b-0 flex items-center justify-center">
                  <div className="w-1/3 h-full border-x-4 border-black/10"></div>
                </div>
                <div className="h-[20%] w-full relative flex justify-center">
                  {/* 1. Black Outline */}
                  <div className="absolute top-0 border-l-[28px] border-r-[28px] border-t-[36px] border-l-transparent border-r-transparent border-t-black"></div>
                  {/* 2. Yellow Wood */}
                  <div className="absolute top-0 border-l-[24px] border-r-[24px] border-t-[32px] border-l-transparent border-r-transparent border-t-[#FFD93D]"></div>
                  {/* 3. Graphite Tip */}
                  <div className="absolute top-[22px] border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-black"></div>
                </div>

                {/* Integrated Magic Dust */}
                <div className="absolute top-1/4 -right-8 text-[#FFD93D] animate-spin">
                  <Star size={32} fill="#FFD93D" strokeWidth={3} className="text-black" />
                </div>
                <div className="absolute bottom-1/4 -left-6 text-[#FF66C4] animate-bounce">
                  <Sparkles size={24} fill="#FF66C4" strokeWidth={3} className="text-black" />
                </div>
              </div>
            </div>
          </div>

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
