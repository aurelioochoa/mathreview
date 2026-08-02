import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function ExpressSummary({ children, color = 'bg-blue-500' }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden bg-surface shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 ${color} text-white font-semibold hover:brightness-110 transition-all`}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">🚀</span>
          Resumen Express
        </span>
        <span className="text-xs opacity-80">Para el modo pánico del examen</span>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {open && (
        <div className="px-4 py-4 bg-gradient-to-b from-gray-50 to-white">
          <p className="text-xs text-gray-500 mb-3 italic">
            Solo lo esencial. Máximo 5 pantallas. Tómate tu tiempo.
          </p>
          {children}
        </div>
      )}
    </div>
  )
}
