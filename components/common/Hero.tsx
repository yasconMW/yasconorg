
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const slides = [
  {
    bg: "/hero/hero1.png",
    label: "Welcome to YASCON",
    heading: "Protecting Nature,\nEmpowering\nMalawi's Youth",
    sub: "YASCON unites young Malawians in grassroots conservation — planting trees, restoring ecosystems, and championing environmental stewardship for future generations.",
    cta1: { label: "Join the Movement", href: "/get-involved" },
    cta2: { label: "Learn More →", href: "/about" },
  },
  {
    bg: "/hero/hero2.png",
    label: "National Tree Planting Season 2026",
    heading: "Together, Let's\nGrow a Greener\nFuture",
    sub: "Every youth club across all 28 districts is called to lead tree-planting activities. The real impact happens when we act locally — starting this week.",
    cta1: { label: "Get Involved", href: "/get-involved" },
    cta2: { label: "Our Work →", href: "/work" },
  },
  {
    bg: "/hero/hero2.png",
    label: "Youth Conservation Programs",
    heading: "The Most\nEnergetic Force\nof Conservation",
    sub: "From biodiversity conservation to climate action, YASCON's nationwide network of youth clubs drives measurable environmental impact across Malawi.",
    cta1: { label: "Our Programs", href: "/programs" },
    cta2: { label: "Read Stories →", href: "/news" },
  },
];

const stripItems = [
  { icon: "👥", num: "50+",  label: "Youth Clubs",       title: "Nationwide Network" },
  { icon: "🌳", num: "10K+", label: "Trees Planted",     title: "Reforestation Impact" },
  { icon: "📍", num: "28",   label: "Districts Reached", title: "All Across Malawi" },
  { icon: "🌿", num: "5K+",  label: "Active Members",    title: "Youth Conservation Force" },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(idx);
    setTimeout(() => setIsAnimating(false), 1200);
  }, [isAnimating]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);


  useEffect(() => {
    const t = setTimeout(next, 6000);
    return () => clearTimeout(t);
  }, [current, next]);

  return (
    <section className="relative w-full h-svh min-h-170 overflow-hidden ">
      {/* Slides */}
      {slides.map((slide, i) => (
        <div key={i} className={`slide ${i === current ? "active" : ""}`}>
          <div
            className="slide-bg "
            style={{ backgroundImage: `url('${slide.bg}')` }}
          />
          <div className="slide-overlay  bg-linear-to-b from-black via-transparent to-transparent" />
           <div className="slide-overlay  bg-black opacity-70" />
          {/* Content — only render for active */}
          {i === current && (
            <div className="relative inset-0 flex items-center z-10 pt-24 sm:pt-24">
              <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
                <div className="max-w-2xl">
                  {/* Badge */}
                  <div className="slide-label mb-5">
                    <span
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5"
                      style={{
                        background: "rgba(212,160,23,.15)",
                        border: "1px solid rgba(212,160,23,.4)",
                        color: "#d4a017",
                        borderRadius: "2px",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#d4a017" }}
                      />
                      {slide.label}
                    </span>
                  </div>

                  {/* Heading */}
                  <h1
                    className="slide-h1 text-white text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] mb-6"
                    style={{
                      whiteSpace: "pre-line",
                    }}
                  >
                    {slide.heading}
                  </h1>

                  {/* Subtext */}
                  <p
                    className="slide-sub mb-9 leading-relaxed"
                    style={{
                      color: "rgba(255,255,255,.75)",
                      fontSize: "clamp(15px, 1.6vw, 17px)",
                      maxWidth: "520px",
                    }}
                  >
                    {slide.sub}
                  </p>

                  {/* Buttons */}
                  <div className="slide-btns flex flex-wrap gap-3 ">
                    <Link href={slide.cta1.href} className=  "bg-yellow-600 hover:bg-yellow-700">
                      <span
                        className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 text-sm tracking-wide cursor-pointer"
                        style={{
                          color: "white",
                          borderRadius: "3px",
                          boxShadow: "0 4px 16px rgba(212,160,23,.35)",
                          transition: "all .2s",
                        }}
                      >
                        {slide.cta1.label}
                      </span>
                    </Link>
                    <Link href={slide.cta2.href} className="hover:bg-green-700">
                      <span
                        className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 text-sm tracking-wide cursor-pointer"
                        style={{
                          background: "transparent",
                          color: "white",
                          border: "1.5px solid rgba(255,255,255,.45)",
                          borderRadius: "3px",
                          transition: "all .2s",
                        }}
                      >
                        {slide.cta2.label}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

    

      {/* Dots */}
      <div
        className="absolute z-20 flex gap-2"
        style={{ bottom: "120px", left: "50%", transform: "translateX(-50%)" }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            className={`slider-dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

         </section>
  );
}
