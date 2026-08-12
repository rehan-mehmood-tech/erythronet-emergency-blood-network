import React, { useRef } from 'react'
import { motion, useSpring } from 'framer-motion'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function MagneticButton({ children, className = '', style = {} }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  // Spring translation values for position pulling
  const x = useSpring(0, { damping: 15, stiffness: 150 })
  const y = useSpring(0, { damping: 15, stiffness: 150 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    
    // Calculate cursor distance from the button center
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Pull strength factor
    const pullX = (e.clientX - centerX) * 0.22
    const pullY = (e.clientY - centerY) * 0.22
    
    x.set(pullX)
    y.set(pullY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, x, y }}
      whileTap={{ scale: 0.96 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  )
}
