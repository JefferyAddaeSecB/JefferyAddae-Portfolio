import React from 'react'

interface Button3DProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export const Button3D: React.FC<Button3DProps> = ({ children, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-3 bg-primary text-white rounded-lg shadow-lg transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-lg"></div>
      {children}
    </button>
  )
} 