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
              {/* Wizard Character */}
              <div className="relative w-24 h-28 flex flex-col items-center">
                {/* Hat */}
                <div className="relative z-30 flex flex-col items-center -mb-3 animate-bounce-slight">
                  {/* Cone */}
                  <div className="w-0 h-0 border-l-[24px] border-r-[24px] border-b-[40px] border-l-transparent border-r-transparent border-b-[#A855F7] drop-shadow-sm relative">
                    <Star size={10} className="absolute top-4 -left-1 text-[#FFD93D] fill-current animate-pulse" />
                    <Star size={8} className="absolute top-2 right-0 text-[#FFD93D] fill-current" />
                  </div>
                  {/* Brim */}
                  <div className="w-20 h-3 bg-[#9333EA] rounded-full border-2 border-[#1a1a1a] transform -rotate-2"></div>
                </div>

                {/* Head */}
                <div className="relative z-20 w-14 h-14 bg-[#FFD93D] rounded-full border-[3px] border-[#1a1a1a] flex items-center justify-center -mt-1 shadow-md">
                  {/* Eyes */}
                  <div className="flex gap-2 -mt-2">
                    <div className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full"></div>
                  </div>
                  {/* Beard */}
                  <div className="absolute bottom-0 w-full h-[60%] bg-white rounded-b-full rounded-t-lg border-t-2 border-gray-100/20"></div>
                </div>

                {/* Wand Hand */}
                <div className="absolute right-0 top-12 z-40 animate-wiggle-fast origin-bottom-left">
                  <div className="w-1.5 h-12 bg-[#8B4513] border border-[#1a1a1a] rounded-full transform rotate-12 relative">
                    <Sparkles size={24} className="absolute -top-4 -right-2 text-[#4DE1C1] fill-current animate-spin-slow" />
                  </div>
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
