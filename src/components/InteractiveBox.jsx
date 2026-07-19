export default function InteractiveBox({ title, children }) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 my-4">
      {title && <h4 className="font-bold text-indigo-700 mb-3 text-sm uppercase tracking-wide">🎮 {title}</h4>}
      {children}
    </div>
  )
}
