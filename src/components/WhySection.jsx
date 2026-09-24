export default function WhySection({ children }) {
  return (
    <div className="panel !border-sky-200 p-5 mb-4 relative overflow-hidden">
      <span className="absolute -right-3 -top-4 text-7xl opacity-10 select-none" aria-hidden="true">🤔</span>
      <h4 className="font-display font-bold text-sky-700 mb-2 flex items-center gap-2">
        <span className="grid place-items-center w-8 h-8 rounded-xl bg-sky-100 text-lg" aria-hidden="true">🤔</span>
        ¿Para qué me sirve esto?
      </h4>
      <div className="text-[15px] text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  )
}
