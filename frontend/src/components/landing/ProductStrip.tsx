import React, { useRef } from 'react';
import { ArrowRight, Quote } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ProductStrip: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      gsap.from('.product-strip-box', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: 'power2.out',
      });

      gsap.from('.pipeline-step', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 0,
        x: -12,
        stagger: 0.08,
        duration: 0.5,
        delay: 0.2,
        ease: 'power2.out',
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-10 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[#3A3F46]/50">
      <div className="product-strip-box rounded-2xl p-[1px] bg-gradient-to-r from-[#454B53] via-[#8D949D] to-[#17191C] shadow-xl overflow-hidden">
        <div className="rounded-[15px] bg-[#101113] overflow-hidden grid grid-cols-1 md:grid-cols-12 items-center">
          {/* Left: Cropped cybernetic character with metallic silver gradient filter */}
          <div className="md:col-span-3 h-32 md:h-full relative overflow-hidden bg-[#08090A] flex items-center justify-center">
            <img
              src="/testimonial-character.png"
              alt="Security Intelligence Character"
              className="w-full h-full object-cover object-left filter brightness-90 contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#101113]/60 to-[#101113]" />
          </div>

          {/* Center: Concise Product Statement */}
          <div className="md:col-span-6 p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-[#C6CBD1]">
              <Quote className="w-4 h-4 fill-current rotate-180" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#C6CBD1] font-bold">
                PRODUCT STATEMENT
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium text-[#F4F5F6] italic leading-relaxed">
              &ldquo;TraceX turns scattered security events into a connected investigation story.&rdquo;
            </p>
            <div className="text-xs font-mono text-[#727982]">
              Autonomous Attack Sequence Reconstruction
            </div>
          </div>

          {/* Right: Liquid Metal Engine Pipeline */}
          <div className="md:col-span-3 p-6 border-t md:border-t-0 md:border-l border-[#3A3F46] flex flex-col justify-center space-y-2 bg-[#08090A]/70">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A4AAB2] font-semibold">
              ENGINE PIPELINE
            </span>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="pipeline-step flex items-center gap-2 text-[#F4F5F6]">
                <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
                <span className="font-bold">DETECT</span>
              </div>
              <div className="pipeline-step flex items-center gap-2 text-[#F4F5F6]">
                <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
                <span className="font-bold">CORRELATE</span>
              </div>
              <div className="pipeline-step flex items-center gap-2 text-[#F4F5F6]">
                <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
                <span className="font-bold">RECONSTRUCT</span>
              </div>
              <div className="pipeline-step flex items-center gap-2 text-[#F4F5F6]">
                <ArrowRight className="w-3 h-3 text-[#39FF6A]" />
                <span className="font-bold">EXPLAIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
