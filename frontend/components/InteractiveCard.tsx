import React, { useRef, useState } from 'react'
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion'

interface InteractiveCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function InteractiveCard({ children, className = '', style = {} }: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Normalised cursor positions (0 to 1) relative to card center
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  // Spring options for smooth 3D tilt effects
  const rotateXSpring = useSpring(useTransform(y, [0, 1], [8, -8]), { damping: 25, stiffness: 120 })
  const rotateYSpring = useSpring(useTransform(x, [0, 1], [-8, 8]), { damping: 25, stiffness: 120 })

  // Spring translation for hover lift
  const translateYSpring = useSpring(useMotionValue(0), { damping: 25, stiffness: 120 })

  // Cursor tracking coordinates for radial gradient border/shine effect
  const glowX = useMotionValue(0)
  const glowY = useMotionValue(0)
  const [showGlow, setShowGlow] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    
    const normalizedX = (e.clientX - rect.left) / rect.width
    const normalizedY = (e.clientY - rect.top) / rect.height
    
    x.set(normalizedX)
    y.set(normalizedY)

    glowX.set(e.clientX - rect.left)
    glowY.set(e.clientY - rect.top)
  }

  const handleMouseEnter = () => {
    setShowGlow(true)
    translateYSpring.set(-6) // lift card by 6px
  }

  const handleMouseLeave = () => {
    setShowGlow(false)
    x.set(0.5)
    y.set(0.5)
    translateYSpring.set(0) // drop card back down
  }

  // Preserve perspective and preservation of 3D elements inside card
  const cardStyle = {
    ...style,
    perspective: 1000,
    transformStyle: 'preserve-3d' as const,
    rotateX: rotateXSpring,
    rotateY: rotateYSpring,
    y: translateYSpring,
  }

  // Radial gradient tracking code
  const glowStyle = {
    background: useTransform(
      [glowX, glowY],
      ([latestX, latestY]) => 
        `radial-gradient(300px circle at ${latestX}px ${latestY}px, rgba(193, 18, 31, 0.08), transparent 80%)`
    ),
    opacity: showGlow ? 1 : 0,
    transition: 'opacity 0.3s ease'
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
      className={`relative group overflow-hidden transition-shadow duration-300 ${className}`}
    >
      {/* cursor tracking shine glow overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10" 
        style={glowStyle}
      />
      {children}
    </motion.div>
  )
}
