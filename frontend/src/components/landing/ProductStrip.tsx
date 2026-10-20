import React from 'react';
import { ArrowRight, Quote } from 'lucide-react';

export const ProductStrip: React.FC = () => {
  return (
    <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#383438]/50">
      <div className="rounded-2xl bg-[#101113] border border-[#383438] overflow-hidden grid grid-cols-1 md:grid-cols-12 items-center">
        {/* Left: Cropped cybernetic character */}
        <div className="md:col-span-3 h-32 md:h-full relative overflow-hidden bg-[#08090A] flex items-center justify-center">
          <img
            src="/testimonial-character.png"
            alt="Security Intelligence Character"
            className="w-full h-full object-cover object-left filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#101113] opacity-80" />
        </div>

        {/* Center: Concise Product Statement */}
        <div className="md:col-span-6 p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-[#E7A1B5]">
            <Quote className="w-4 h-4 fill-current rotate-180" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#E7A1B5] font-bold">
              PRODUCT STATEMENT
            </span>
          </div>
          <p className="text-sm sm:text-base font-medium text-[#F4F2F3] italic leading-relaxed">
            &ldquo;TraceX turns scattered security events into a connected investigation story.&rdquo;
          </p>
          <div className="text-xs font-mono text-[#A5A3A7]">
            Autonomous Attack Sequence Reconstruction
          </div>
        </div>

        {/* Right: Compact Visual Sequence */}
        <div className="md:col-span-3 p-6 border-t md:border-t-0 md:border-l border-[#383438] flex flex-col justify-center space-y-2 bg-[#08090A]/60">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A3A7] font-semibold">
            ENGINE PIPELINE
          </span>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#F4F2F3]">
              <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
              <span className="font-bold">DETECT</span>
            </div>
            <div className="flex items-center gap-2 text-[#F4F2F3]">
              <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
              <span className="font-bold">CORRELATE</span>
            </div>
            <div className="flex items-center gap-2 text-[#F4F2F3]">
              <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
              <span className="font-bold">RECONSTRUCT</span>
            </div>
            <div className="flex items-center gap-2 text-[#F4F2F3]">
              <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
              <span className="font-bold">EXPLAIN</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
