import { useState, useRef, useEffect } from 'react'

export default function GlossaryTerm({ term, definition, children }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef(null)
  const termRef = useRef(null)

  useEffect(() => {
    if (showTooltip && tooltipRef.current && termRef.current) {
      const termRect = termRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      
      // Adjust if tooltip goes off screen
      if (termRect.left + tooltipRect.width > window.innerWidth) {
        tooltipRef.current.style.left = 'auto'
        tooltipRef.current.style.right = '0'
      }
    }
  }, [showTooltip])

  return (
    <span className="relative inline-block">
      <span
        ref={termRef}
        className="border-b-2 border-dotted border-gray-400 cursor-help text-gray-800 font-medium hover:text-blue-600 hover:border-blue-400 transition-colors"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(!showTooltip)}
      >
        {children || term}
      </span>
      
      {showTooltip && (
        <span
          ref={tooltipRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-50 min-w-[200px] max-w-[280px]"
        >
          <span className="font-semibold block mb-1 text-yellow-300">{term}</span>
          {definition}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></span>
        </span>
      )}
    </span>
  )
}
