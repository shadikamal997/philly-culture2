"use client";

import { motion } from "framer-motion";

interface ProgramCard {
  image: string;
  category: string;
  title: string;
  onClick?: () => void;
}

interface ProgramSliderProps {
  programs: ProgramCard[];
}

export function ProgramSlider({ programs }: ProgramSliderProps) {
  if (programs.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-12">
      {/* Scrolling Container */}
      <motion.div
        className="flex items-center"
        animate={{
          x: [0, -((programs.length * 450) / 2)],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: programs.length * 4,
            ease: "linear",
          },
        }}
        style={{
          gap: "32px",
        }}
      >
        {/* Duplicate programs for seamless loop */}
        {[...programs, ...programs].map((program, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05, y: -10 }}
            transition={{ duration: 0.3 }}
            onClick={program.onClick}
            className="flex-shrink-0 cursor-pointer relative overflow-hidden rounded-3xl shadow-2xl"
            style={{
              width: "420px",
              height: "560px",
            }}
          >
            {/* Image */}
            <img
              src={program.image}
              alt={program.title}
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 100%)",
              }}
            />

            {/* Text Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-3">
              <span className="font-semibold text-sm text-gray-600 uppercase tracking-[0.15em]">
                {program.category}
              </span>
              <h3 className="font-bold text-3xl text-gray-900 leading-tight">
                {program.title}
              </h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
