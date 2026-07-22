import MathTex from '../components/MathTex'

export default function AtuendosEjemplo() {
  const camisas = ['🔴', '🔵', '🟢']
  const pantalones = ['👖', '👖', '👖', '👖']
  const zapatos = ['👟', '👞']

  const total = camisas.length * pantalones.length * zapatos.length

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
        <div className="glass rounded-xl p-3 border">
          <p className="font-bold mb-2">Camisas</p>
          <p className="text-3xl">{camisas.join(' ')}</p>
          <p className="text-pink-600 font-bold mt-1">{camisas.length} opciones</p>
        </div>
        <div className="glass rounded-xl p-3 border">
          <p className="font-bold mb-2">Pantalones</p>
          <p className="text-3xl">👖×4</p>
          <p className="text-pink-600 font-bold mt-1">{pantalones.length} opciones</p>
        </div>
        <div className="glass rounded-xl p-3 border">
          <p className="font-bold mb-2">Zapatos</p>
          <p className="text-3xl">{zapatos.join(' ')}</p>
          <p className="text-pink-600 font-bold mt-1">{zapatos.length} opciones</p>
        </div>
      </div>

      <div className="text-center glass rounded-xl p-4">
        <MathTex expr={`${camisas.length} \\times ${pantalones.length} \\times ${zapatos.length} = ${total}`} />
        <p className="text-xl font-bold text-pink-600 mt-2">¡{total} atuendos diferentes!</p>
      </div>
    </div>
  )
}
