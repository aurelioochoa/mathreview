export default function CommonMistakes({ mistakes }) {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-l-4 border-orange-400 mb-4">
      <h4 className="font-bold text-orange-800 mb-3 text-sm flex items-center gap-2">
        <span className="text-lg">⚠️</span> Trampas típicas
      </h4>
      <ul className="space-y-2">
        {mistakes.map((mistake, index) => (
          <li key={index} className="text-sm text-gray-700 flex gap-2">
            <span className="text-orange-500">•</span>
            <span><em>{mistake}</em></span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-orange-600 mt-2 italic">
        Si te equivocaste en alguna de estas, no te preocupes — son los errores más comunes que cometemos al principio.
      </p>
    </div>
  )
}
