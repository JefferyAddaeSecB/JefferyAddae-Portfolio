import React, { useState, useEffect } from 'react'

interface TypingAnimationProps {
  text: string
  speed?: number
  className?: string
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  speed = 100,
  className = ''
}) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, speed])

  return (
    <span className={`inline-block ${className}`}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export default TypingAnimation 