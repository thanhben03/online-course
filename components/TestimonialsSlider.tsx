"use client";

import Image from "next/image";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export interface TestimonialItem {
  id?: number;
  name: string;
  role?: string;
  avatar: string;
  content: string;
  rating?: number;
}

export default function TestimonialsSlider({ testimonials }: { testimonials: TestimonialItem[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (delta: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ scrollBehavior: "smooth" }}
      >
        {testimonials.map((t, idx) => (
          <div key={t.id ?? idx} className="min-w-[85%] sm:min-w-[60%] md:min-w-[45%] lg:min-w-[32%] snap-center">
            <Card className="border-0 shadow-lg h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: Number(t.rating) || 0 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={t.avatar} alt={t.name} width={40} height={40} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t.name}</p>
                    {t.role ? <p className="text-sm text-gray-500">{t.role}</p> : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Arrow controls (hidden on very small lists) */}
      {testimonials.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByAmount(-400)}
            className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByAmount(400)}
            className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border hover:bg-gray-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}


