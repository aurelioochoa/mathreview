// Laboratorio: el marco de cada visualización interactiva del briefing. Con
// cabecera propia para que se distinga de la teoría: aquí se toca.
export default function InteractiveBox({ title, children }) {
  return (
    <div className="panel !border-indigo-200 overflow-hidden my-4">
      {title && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-white/20 text-base" aria-hidden="true">🧪</span>
          <h4 className="font-display font-bold text-sm sm:text-base tracking-wide">{title}</h4>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-white/20 rounded-full px-2 py-0.5">Interactivo</span>
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}
