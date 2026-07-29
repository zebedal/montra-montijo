"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function DirectoryHeroIllustration() {
  const reduceMotion = useReducedMotion();

  const floating = (delay: number) =>
    reduceMotion
      ? undefined
      : {
          y: [0, -6, 0],
          transition: {
            duration: 4.5,
            delay,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };

  return (
    <motion.svg
      viewBox="0 0 430 360"
      role="img"
      aria-label="Ilustração de descoberta do comércio local"
      initial={reduceMotion ? false : { opacity: 0, x: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="h-auto w-full overflow-visible"
    >
      <circle cx="226" cy="180" r="139" fill="#ead8bc" opacity="0.5" />
      <circle cx="226" cy="180" r="112" fill="#f8f1e6" opacity="0.72" />

      <motion.path
        d="M48 268C94 292 111 224 155 242C193 257 194 311 245 298C291 286 289 223 338 228C368 231 383 249 397 267"
        fill="none"
        stroke="#b98951"
        strokeWidth="3"
        strokeDasharray="7 10"
        strokeLinecap="round"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.55 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />

      <motion.g animate={floating(0.2)}>
        <path
          d="M77 99c0-22 17-39 39-39s39 17 39 39c0 30-39 69-39 69S77 129 77 99Z"
          fill="#b8673d"
        />
        <circle cx="116" cy="99" r="15" fill="#fff7eb" />
        <circle cx="116" cy="99" r="7" fill="#315f4a" />
      </motion.g>

      <g>
        <rect x="142" y="139" width="174" height="124" rx="10" fill="#fffdf8" />
        <rect x="156" y="183" width="146" height="80" rx="4" fill="#dce9e1" />
        <rect x="174" y="194" width="49" height="69" rx="3" fill="#fffaf1" />
        <rect x="231" y="194" width="56" height="42" rx="3" fill="#9dbdaa" />
        <path d="M134 139h190l-16-45H151l-17 45Z" fill="#fff7e8" />
        <path d="M151 94h31l-6 45h-42l17-45Z" fill="#315f4a" />
        <path d="M182 94h31l-2 45h-35l6-45Z" fill="#e8b647" />
        <path d="M213 94h32l3 45h-37l2-45Z" fill="#f7f0e4" />
        <path d="M245 94h31l9 45h-37l-3-45Z" fill="#b8673d" />
        <path d="M276 94h32l16 45h-39l-9-45Z" fill="#315f4a" />
        <path
          d="M134 139c0 13 10 23 22 23 10 0 18-6 21-14 3 8 11 14 21 14 11 0 20-7 23-16 3 9 12 16 23 16s20-7 23-16c3 9 12 16 23 16 13 0 23-10 23-23H134Z"
          fill="#fffaf1"
          opacity="0.92"
        />
        <rect x="154" y="263" width="151" height="8" rx="4" fill="#7f9f8d" opacity="0.6" />
        <circle cx="213" cy="229" r="3" fill="#b8673d" />
      </g>

      <motion.g animate={floating(0.8)}>
        <circle cx="347" cy="100" r="41" fill="#fffaf1" stroke="#d4b98f" strokeWidth="2" />
        <circle cx="340" cy="93" r="15" fill="none" stroke="#315f4a" strokeWidth="6" />
        <path d="m351 105 13 14" stroke="#315f4a" strokeWidth="6" strokeLinecap="round" />
      </motion.g>

      <motion.g animate={floating(1.3)}>
        <rect x="55" y="210" width="63" height="58" rx="19" fill="#fffaf1" stroke="#e2cda9" strokeWidth="2" />
        <path d="M75 229h24l5 24H70l5-24Z" fill="none" stroke="#9a5b00" strokeWidth="3" strokeLinejoin="round" />
        <path d="M80 232v-7a7 7 0 0 1 14 0v7" fill="none" stroke="#9a5b00" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      <motion.g animate={floating(1.8)}>
        <rect x="326" y="215" width="65" height="58" rx="19" fill="#fffaf1" stroke="#e2cda9" strokeWidth="2" />
        <path d="M344 252c12-2 20-10 24-24-14 3-22 11-24 24Z" fill="#78a38d" />
        <path d="M344 252c5-10 11-16 22-22" fill="none" stroke="#315f4a" strokeWidth="2.5" strokeLinecap="round" />
      </motion.g>

      <circle cx="67" cy="297" r="7" fill="#e8b647" />
      <circle cx="378" cy="303" r="9" fill="#b8673d" opacity="0.75" />
      <path d="M107 313h41" stroke="#315f4a" strokeWidth="5" strokeLinecap="round" opacity="0.22" />
      <path d="M294 59h31" stroke="#b8673d" strokeWidth="5" strokeLinecap="round" opacity="0.3" />
    </motion.svg>
  );
}
