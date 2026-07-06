"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TestimonialData {
  quote: string;
  author: string;
  title: string;
  company: string;
  image: string;
}

const testimonials: TestimonialData[] = [
  {
    quote:
      "For small teams with complex and unique GPU workloads, I think PodCat is the perfect infrastructure provider.",
    author: "Yasyf Mohamedali",
    title: "Co-founder",
    company: "Aneta",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=1600&fit=crop&q=80",
  },
  {
    quote:
      "PodCat has revolutionized how we handle our machine learning pipelines. The scalability is unmatched.",
    author: "Sarah Chen",
    title: "CTO",
    company: "DataFlow AI",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=1600&fit=crop&q=80",
  },
  {
    quote:
      "We cut our infrastructure costs by 60% after switching to PodCat. The serverless GPUs are game-changing.",
    author: "Marcus Johnson",
    title: "Lead Engineer",
    company: "NeuralSpace",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&h=1600&fit=crop&q=80",
  },
];

export function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[activeIndex];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={current.image}
          alt={current.author}
          fill
          className="object-cover transition-all duration-700"
          priority
          sizes="50vw"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative flex h-full flex-col justify-end p-12">
        <div className="space-y-6">
          <p className="text-2xl font-light text-purple-300">{current.company}</p>
          <blockquote className="text-3xl font-medium leading-relaxed text-white">
            &ldquo;{current.quote}&rdquo;
          </blockquote>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-white">{current.author}</p>
            <p className="text-sm text-gray-400">
              {current.title} at {current.company}
            </p>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="mt-8 flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                activeIndex === index
                  ? "w-8 bg-white"
                  : "w-2 bg-gray-500 hover:bg-gray-400"
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
