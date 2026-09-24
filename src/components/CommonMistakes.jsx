export default function CommonMistakes({ mistakes }) {
  return (
    <div className="panel !border-orange-200 p-5 mb-4">
      <h4 className="font-display font-bold text-orange-700 mb-3 flex items-center gap-2">
        <span className="grid place-items-center w-8 h-8 rounded-xl bg-orange-100 text-lg" aria-hidden="true">⚠️</span>
        Trampas típicas
      </h4>
      <ul className="space-y-2">
        {mistakes.map((mistake, index) => (
          <li key={index} className="text-sm text-gray-700 flex gap-3 items-start rounded-xl bg-orange-50/70 border border-orange-100 px-3 py-2">
            <span className="shrink-0 grid place-items-center w-6 h-6 rounded-full bg-orange-400 text-white text-xs font-bold">{index + 1}</span>
            <span><em>{mistake}</em></span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-orange-600 mt-3 italic">
        Si te equivocaste en alguna de estas, no te preocupes — son los errores más comunes que cometemos al principio.
      </p>
    </div>
  )
}
