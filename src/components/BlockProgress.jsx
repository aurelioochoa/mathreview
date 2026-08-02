export default function BlockProgress({ current, total, blockName }) {
  const percentage = Math.round((current / total) * 100)
  
  return (
    <div className="bg-surface rounded-xl p-3 border border-gray-200 shadow-sm mb-6 sticky top-20 z-40">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">{blockName}</span>
        <span className="text-xs text-gray-500">{current} de {total} completados ✅</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}
