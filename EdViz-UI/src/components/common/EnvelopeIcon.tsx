import React from 'react';
import { motion } from 'framer-motion';

interface EnvelopeIconProps {
  isHovered: boolean;
}

const EnvelopeIcon: React.FC<EnvelopeIconProps> = ({ isHovered }) => {
  const envelopeBodyVariants = {
    closed: {
      d: "M3 6v12h18V6H3z",
    },
    open: {
      d: "M3 8v10h18V8H3z",
    }
  };

  const flapVariants = {
    closed: {
      d: "M3 6l9 6 9-6",
      opacity: 1
    },
    open: {
      d: "M3 6l9 2 9-2",
      opacity: 0.7
    }
  };

  const letterVariants = {
    closed: {
      scaleY: 0,
      y: 0,
      opacity: 0
    },
    open: {
      scaleY: 1,
      y: -2,
      opacity: 1
    }
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="32"
      height="32"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
    >
      {/* Envelope body */}
      <motion.path
        initial="closed"
        animate={isHovered ? "open" : "closed"}
        variants={envelopeBodyVariants}
        transition={{ duration: 0.3 }}
        fill="none"
        strokeLinejoin="round"
      />

      {/* Front flap animation */}
      <motion.path
        initial="closed"
        animate={isHovered ? "open" : "closed"}
        variants={flapVariants}
        transition={{ duration: 0.3 }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter inside */}
      <motion.path
        d="M5 8h14v8H5z"
        initial="closed"
        animate={isHovered ? "open" : "closed"}
        variants={letterVariants}
        transition={{ duration: 0.2, delay: isHovered ? 0.1 : 0 }}
        fill="currentColor"
        opacity={0.9}
      />

      {/* Letter lines */}
      <motion.g
        initial="closed"
        animate={isHovered ? "open" : "closed"}
        variants={letterVariants}
        transition={{ duration: 0.2, delay: isHovered ? 0.15 : 0 }}
        stroke="none"
        fill="none"
        strokeWidth="0.5"
      >
        <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" />
        <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" />
        <line x1="7" y1="14" x2="13" y2="14" stroke="currentColor" />
      </motion.g>
    </svg>
  );
};

export default EnvelopeIcon; 