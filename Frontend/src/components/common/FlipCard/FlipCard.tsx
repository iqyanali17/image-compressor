import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export const FlipCard = ({ front, back, className = '' }: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`block w-full h-full cursor-pointer ${className}`} 
      style={{ perspective: 1200 }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
      onFocus={() => setIsFlipped(true)}
      onBlur={() => setIsFlipped(false)}
      tabIndex={0}
    >
      <motion.div
        className="w-full h-full grid"
        style={{ transformStyle: 'preserve-3d', gridTemplateAreas: '"a"' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div 
          className="w-full h-full" 
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', gridArea: 'a' }}
        >
          {front}
        </div>
        <div 
          className="w-full h-full" 
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', gridArea: 'a' }}
          aria-hidden
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
