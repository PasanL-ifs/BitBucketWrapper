import { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export default function AnimatedNumber({ value, format, duration = 2 }) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)
  
  useEffect(() => {
    const startValue = prevValue.current
    const endValue = value
    const startTime = Date.now()
    const animDuration = duration * 1000

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animDuration, 1)
      
      // Easing function (ease-out-expo)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      const current = Math.floor(startValue + (endValue - startValue) * eased)
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
        prevValue.current = endValue
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  const formattedValue = format ? format(displayValue) : displayValue.toLocaleString()

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      {formattedValue}
    </motion.span>
  )
}
