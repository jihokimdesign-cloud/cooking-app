'use client';

import { motion } from 'framer-motion';

interface CheffyCharacterProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function CheffyCharacter({ size = 'md', animated = true, className = '' }: CheffyCharacterProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-4xl',
    md: 'w-24 h-24 text-6xl',
    lg: 'w-32 h-32 text-8xl',
  };

  const cheffyVariants = {
    wave: {
      rotate: [0, 14, -8, 14, -4, 10, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 2,
      },
    },
    bounce: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 1,
      },
    },
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} flex items-center justify-center`}
      animate={animated ? ['wave', 'bounce'] : {}}
      variants={cheffyVariants}
    >
      <div className="relative">
        {/* Cheffy 캐릭터 - 이모지 또는 SVG로 표현 */}
        <div className="text-6xl md:text-8xl">👨‍🍳</div>
        {/* 향후 3D 모델이나 더 정교한 SVG로 교체 가능 */}
      </div>
    </motion.div>
  );
}

