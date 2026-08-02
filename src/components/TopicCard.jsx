import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function TopicCard({ title, icon, color = 'bg-primary', children }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-surface rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-8">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-6 py-4 text-left ${color} text-white font-bold text-lg cursor-pointer hover:brightness-110 transition-all`}
      >
        {icon && <span className="text-2xl">{icon}</span>}
        <span className="flex-1">{title}</span>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && (
        <div className="px-6 py-5 space-y-4 text-gray-700 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}
