import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  
  // Trigger viewport checking
  const inView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' })
  
  const motionValue = useMotionValue(0)
  
  // Spring settings for smooth 2-second ease-out counting
  const springValue = useSpring(motionValue, {
    damping: 35,
    stiffness: 90,
    mass: 1
  })

  // Format numerical output dynamically with commas and decimals
  const displayValue = useTransform(springValue, (latest) => {
    const formatted = latest.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    return `${prefix}${formatted}${suffix}`
  })

  useEffect(() => {
    if (inView) {
      motionValue.set(value)
    }
  }, [inView, value, motionValue])

  useEffect(() => {
    // Directly mutate textContent of span ref to avoid React render overhead on every spring tick
    const unsubscribe = displayValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = latest
      }
    })
    return () => unsubscribe()
  }, [displayValue])

  // Render initial zero value safely for SSR / layout transition sanity
  const initialValue = (0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  return (
    <span ref={ref}>
      {prefix}{initialValue}{suffix}
    </span>
  )
}
