export default function WhySection({ children }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-l-4 border-blue-400 mb-4">
      <h4 className="font-bold text-blue-800 mb-2 text-sm flex items-center gap-2">
        <span className="text-lg">🤔</span> ¿Para qué me sirve esto?
      </h4>
      <div className="text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  )
}
