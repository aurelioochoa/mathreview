import { useState } from 'react'
import { Mafs, Coordinates, Polygon, Text as MafsText, Theme } from 'mafs'
import TopicCard from '../components/TopicCard'
import InteractiveBox from '../components/InteractiveBox'
import MathTex from '../components/MathTex'
import MiniQuiz from '../components/MiniQuiz'
import WhySection from '../components/WhySection'
import CommonMistakes from '../components/CommonMistakes'
import BlockProgress from '../components/BlockProgress'
import ExpressSummary from '../components/ExpressSummary'
import GlossaryTerm from '../components/GlossaryTerm'

function PitagorasSection() {
  const [catA, setCatA] = useState(3)
  const [catB, setCatB] = useState(4)
  const hip = Math.sqrt(catA * catA + catB * catB)

  const quizQuestions = [
    {
      question: "Un triángulo rectángulo tiene catetos de 6 y 8. ¿Cuánto mide la hipotenusa?",
      options: ["10", "14", "48", "100"],
      correctAnswer: 0,
      hint: "6² + 8² = 36 + 64 = 100 = 10²",
      reminder: "a² + b² = c². Los triángulos 3-4-5 y sus múltiplos (6-8-10, 9-12-15) son muy comunes."
    },
    {
      question: "Si la hipotenusa mide 13 y un cateto mide 5, ¿cuánto mide el otro cateto?",
      options: ["8", "12", "18", "169"],
      correctAnswer: 0,
      hint: "13² = 169, 5² = 25. 169 - 25 = 144 = 12²",
      reminder: "Despeja: b² = c² - a². El triple 5-12-13 es otro clásico."
    },
    {
      question: "¿Cuál es el Teorema de Pitágoras?",
      options: ["a + b = c", "a² + b² = c²", "a × b = c", "a² × b² = c²"],
      correctAnswer: 1,
      hint: "Es la suma de los CUADRADOS de los catetos igual al CUADRADO de la hipotenusa.",
      reminder: "a² + b² = c², donde c es la hipotenusa (el lado más largo, frente al ángulo recto)."
    }
  ]

  return (
    <TopicCard title="Teorema de Pitágoras" icon="📐" color="bg-bloque5">
      <WhySection>
        En Minecraft, quieres construir una rampa diagonal entre dos puntos.
        <br />
        ¿Cuántos bloques necesitas? Pitágoras te da la distancia exacta.
        <br />
        También sirve para verificar ángulos rectos: si 3² + 4² = 5², ¡el ángulo es de 90°!
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Confundir catetos con hipotenusa: la hipotenusa es SIEMPRE el lado más largo (frente al ángulo de 90°).",
          "Olvidar elevar al cuadrado: es a² + b² = c², no a + b = c.",
          "Usar Pitágoras en triángulos que NO son rectángulos — el teorema solo aplica a triángulos con ángulo de 90°."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        El <GlossaryTerm term="Teorema de Pitágoras" definition="En un triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos: a² + b² = c²">Teorema de Pitágoras</GlossaryTerm> es probablemente la fórmula más famosa de las matemáticas.
        Dice que en un <strong>triángulo rectángulo</strong> (el que tiene un ángulo de 90°), 
        el lado más largo (hipotenusa) al cuadrado es igual a la suma de los cuadrados de los otros dos lados (catetos).
      </p>

      <div className="text-center my-4">
        <MathTex expr={"a^2 + b^2 = c^2"} display />
      </div>

      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <p className="font-semibold text-red-800 mb-2">¿Por qué funciona? — Demostración con áreas</p>
        <p className="text-sm">
          Imagina que construyes un <strong>cuadrado</strong> en cada lado del triángulo.
          El área del cuadrado grande (sobre la hipotenusa) es <strong>exactamente igual</strong> a 
          la suma de las áreas de los otros dos cuadrados.
          Es como si pudieras "llenar" el cuadrado grande con las piezas de los dos pequeños.
        </p>
        <div className="mt-2 text-sm">
          <p>Ejemplo clásico: Triángulo 3-4-5</p>
          <MathTex expr={"3^2 + 4^2 = 9 + 16 = 25 = 5^2 \\quad \\checkmark"} display />
        </div>
      </div>

      <InteractiveBox title="Calculadora de Pitágoras">
        <div className="flex items-center gap-4 flex-wrap mb-4">
          <div>
            <label className="block text-xs font-medium mb-1">Cateto a</label>
            <input type="number" value={catA} onChange={e => setCatA(Number(e.target.value) || 1)}
              className="border rounded-lg px-3 py-2 w-24 font-mono text-center focus:ring-2 focus:ring-red-400 outline-none" min={0.1} step={0.5} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Cateto b</label>
            <input type="number" value={catB} onChange={e => setCatB(Number(e.target.value) || 1)}
              className="border rounded-lg px-3 py-2 w-24 font-mono text-center focus:ring-2 focus:ring-red-400 outline-none" min={0.1} step={0.5} />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium mb-1">Hipotenusa c</p>
            <p className="text-2xl font-bold text-red-600 font-mono">{hip.toFixed(3)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-hidden border">
          <Mafs viewBox={{ x: [-1, Math.max(catA, catB) + 2], y: [-1, Math.max(catA, catB) + 2] }} height={300}>
            <Coordinates.Cartesian />
            <Polygon
              points={[[0, 0], [catA, 0], [0, catB]]}
              color={Theme.red}
            />
            <MafsText x={catA / 2} y={-0.5} size={16}>a = {catA}</MafsText>
            <MafsText x={-0.7} y={catB / 2} size={16}>b = {catB}</MafsText>
            <MafsText x={catA / 2 + 0.3} y={catB / 2 + 0.3} size={16}>c = {hip.toFixed(2)}</MafsText>
          </Mafs>
        </div>

        <div className="mt-3 text-center text-sm">
          <MathTex expr={`${catA}^2 + ${catB}^2 = ${(catA*catA).toFixed(1)} + ${(catB*catB).toFixed(1)} = ${(catA*catA + catB*catB).toFixed(1)}`} />
          <br />
          <MathTex expr={`c = \\sqrt{${(catA*catA + catB*catB).toFixed(1)}} = ${hip.toFixed(3)}`} />
        </div>

        <div className="mt-4 bg-red-50 rounded p-3 text-sm">
          <p className="font-semibold">Áreas de los cuadrados:</p>
          <div className="flex gap-4 justify-center mt-1">
            <span>a²= <strong>{(catA * catA).toFixed(1)}</strong></span>
            <span>+</span>
            <span>b² = <strong>{(catB * catB).toFixed(1)}</strong></span>
            <span>=</span>
            <span>c² = <strong>{(hip * hip).toFixed(1)}</strong></span>
          </div>
        </div>
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function TrigonometriaSection() {
  const [angulo, setAngulo] = useState(30)
  const rad = angulo * Math.PI / 180
  const sen = Math.sin(rad)
  const cos = Math.cos(rad)
  const tan = angulo === 90 ? Infinity : Math.tan(rad)

  const hip = 5
  const catOp = hip * sen
  const catAd = hip * cos

  const quizQuestions = [
    {
      question: "En un triángulo rectángulo con ángulo de 30°, si la hipotenusa es 10, ¿cuánto mide el cateto opuesto?",
      options: ["5", "8.66", "10", "0.5"],
      correctAnswer: 0,
      hint: "sen(30°) = 0.5. Cateto opuesto = hipotenusa × sen(30°) = 10 × 0.5 = 5",
      reminder: "sen(α) = opuesto/hipotenusa → opuesto = hipotenusa × sen(α)"
    },
    {
      question: "¿Qué significa SOH-CAH-TOA?",
      options: ["Una marca de autos", "Un truco para memorizar seno, coseno y tangente", "Una fórmula de áreas", "Un tipo de triángulo"],
      correctAnswer: 1,
      hint: "SOH: Seno = Opuesto/Hipotenusa, CAH: Coseno = Adyacente/Hipotenusa, TOA: Tangente = Opuesto/Adyacente",
      reminder: "SOH-CAH-TOA te ayuda a recordar las razones trigonométricas."
    },
    {
      question: "Si cos(60°) = 0.5, ¿cuánto mide el cateto adyacente si la hipotenusa es 8?",
      options: ["4", "6.93", "8", "16"],
      correctAnswer: 0,
      hint: "cos(60°) = adyacente/hipotenusa → adyacente = hipotenusa × cos(60°) = 8 × 0.5 = 4",
      reminder: "cos(α) = adyacente/hipotenusa → adyacente = hipotenusa × cos(α)"
    }
  ]

  return (
    <TopicCard title="Razones Trigonométricas" icon="📏" color="bg-bloque5">
      <p>
        Las <strong>razones trigonométricas</strong> relacionan los <strong>ángulos</strong> de un triángulo rectángulo
        con sus <strong>lados</strong>. Son como "recetas" que te dicen cuánto mide cada lado según el ángulo.
      </p>

      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <p className="font-semibold text-red-800 mb-2">Las tres razones principales (SOH-CAH-TOA):</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-lg p-3">
            <p className="text-2xl font-bold text-red-500">Sen</p>
            <MathTex expr={"\\sin(\\alpha) = \\frac{\\text{opuesto}}{\\text{hipotenusa}}"} />
            <p className="text-xs text-gray-500 mt-1"><strong>S</strong>eno = <strong>O</strong>puesto / <strong>H</strong>ipotenusa</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-2xl font-bold text-blue-500">Cos</p>
            <MathTex expr={"\\cos(\\alpha) = \\frac{\\text{adyacente}}{\\text{hipotenusa}}"} />
            <p className="text-xs text-gray-500 mt-1"><strong>C</strong>oseno = <strong>A</strong>dyacente / <strong>H</strong>ipotenusa</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-2xl font-bold text-green-500">Tan</p>
            <MathTex expr={"\\tan(\\alpha) = \\frac{\\text{opuesto}}{\\text{adyacente}}"} />
            <p className="text-xs text-gray-500 mt-1"><strong>T</strong>angente = <strong>O</strong>puesto / <strong>A</strong>dyacente</p>
          </div>
        </div>
        <p className="text-xs text-center text-red-600 mt-2">
          💡 Truco para memorizar: "<strong>SOH-CAH-TOA</strong>" — las iniciales de cada fórmula
        </p>
      </div>

      <InteractiveBox title="Triángulo interactivo — Cambia el ángulo">
        <div className="mb-4">
          <label className="block text-sm font-bold text-red-700 mb-1">
            Ángulo α = {angulo}°
          </label>
          <input type="range" min={5} max={85} step={1} value={angulo}
            onChange={e => setAngulo(Number(e.target.value))}
            className="w-full max-w-sm accent-red-500" />
        </div>

        <div className="bg-white rounded-lg overflow-hidden border">
          <Mafs viewBox={{ x: [-0.5, 6], y: [-0.5, 6] }} height={300}>
            <Coordinates.Cartesian />
            <Polygon
              points={[[0, 0], [catAd, 0], [0, catOp]]}
              color={Theme.red}
            />
            <MafsText x={catAd / 2} y={-0.4} size={14}>
              adyacente = {catAd.toFixed(2)}
            </MafsText>
            <MafsText x={-0.5} y={catOp / 2} size={14}>
              opuesto = {catOp.toFixed(2)}
            </MafsText>
            <MafsText x={catAd / 2 + 0.5} y={catOp / 2 + 0.3} size={14}>
              hip = {hip}
            </MafsText>
            <MafsText x={0.8} y={0.3} size={14}>
              α = {angulo}°
            </MafsText>
          </Mafs>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="bg-red-50 rounded-lg p-3">
            <p className="font-bold text-red-600">sen({angulo}°)</p>
            <p className="text-xl font-mono">{sen.toFixed(4)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="font-bold text-blue-600">cos({angulo}°)</p>
            <p className="text-xl font-mono">{cos.toFixed(4)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="font-bold text-green-600">tan({angulo}°)</p>
            <p className="text-xl font-mono">{isFinite(tan) ? tan.toFixed(4) : '∞'}</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-2">
          Identidad fundamental: sen²(α) + cos²(α) = {(sen * sen + cos * cos).toFixed(4)} ≈ 1 ✓
        </p>
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function CilindroSection() {
  const [radio, setRadio] = useState(3)
  const [altura, setAltura] = useState(5)

  const areaLateral = 2 * Math.PI * radio * altura
  const areaBase = Math.PI * radio * radio
  const areaTotal = areaLateral + 2 * areaBase

  const quizQuestions = [
    {
      question: "Un cilindro tiene radio 3 y altura 5. ¿Cuál es el área lateral?",
      options: ["30π", "15π", "45π", "54π"],
      correctAnswer: 0,
      hint: "A_L = 2πrh = 2π(3)(5) = 30π",
      reminder: "Área lateral = 2π × radio × altura. Es como desenrollar el cilindro en un rectángulo."
    },
    {
      question: "¿Cuál es el área total de un cilindro?",
      options: ["Solo el área lateral", "Área lateral + área de las dos tapas", "πr²", "2πr"],
      correctAnswer: 1,
      hint: "Área total = área lateral + 2 × área de la base",
      reminder: "No olvides las dos tapas circulares (arriba y abajo)."
    },
    {
      question: "Si desenrollas un cilindro, ¿qué forma tiene la superficie lateral?",
      options: ["Un círculo", "Un rectángulo", "Un triángulo", "Una parábola"],
      correctAnswer: 1,
      hint: "La superficie lateral se convierte en un rectángulo: base = perímetro del círculo, altura = altura del cilindro",
      reminder: "El perímetro del círculo es 2πr, que se convierte en la base del rectángulo."
    }
  ]

  return (
    <TopicCard title="El Cilindro" icon="🥫" color="bg-bloque5">
      <p>
        Un <strong>cilindro</strong> es como una lata de refresco: dos círculos (tapas) unidos por una superficie curva.
        Si "desenrollas" la superficie curva, obtienes un <strong>rectángulo</strong>. ¡Esa es su red o patrón!
      </p>

      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <p className="font-semibold text-red-800 mb-2">Fórmulas del cilindro:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="bg-white rounded p-3 text-center">
            <p className="font-bold">Área Lateral</p>
            <MathTex expr={"A_L = 2\\pi r \\cdot h"} />
            <p className="text-xs text-gray-500 mt-1">Rectángulo desenrollado: base = perímetro del círculo</p>
          </div>
          <div className="bg-white rounded p-3 text-center">
            <p className="font-bold">Área Total</p>
            <MathTex expr={"A_T = 2\\pi r h + 2\\pi r^2"} />
            <p className="text-xs text-gray-500 mt-1">Lateral + 2 tapas circulares</p>
          </div>
        </div>
      </div>

      <InteractiveBox title="Calculadora del cilindro">
        <div className="flex gap-4 mb-4 flex-wrap">
          <div>
            <label className="block text-xs font-bold text-red-700 mb-1">Radio = {radio}</label>
            <input type="range" min={1} max={8} step={0.5} value={radio}
              onChange={e => setRadio(Number(e.target.value))}
              className="w-40 accent-red-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-red-700 mb-1">Altura = {altura}</label>
            <input type="range" min={1} max={12} step={0.5} value={altura}
              onChange={e => setAltura(Number(e.target.value))}
              className="w-40 accent-red-500" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div className="relative w-32 flex flex-col items-center">
            <div className="w-full bg-red-200 rounded-t-full h-6 border-2 border-red-400" />
            <div className="w-full bg-red-100 border-l-2 border-r-2 border-red-400" style={{ height: `${altura * 15}px` }} />
            <div className="w-full bg-red-200 rounded-b-full h-6 border-2 border-red-400" />
            <p className="text-xs text-gray-500 mt-1">r={radio}, h={altura}</p>
          </div>
          <div className="text-3xl text-gray-400">→</div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-red-100 border-2 border-red-400 rounded-full" style={{ width: `${radio * 16}px`, height: `${radio * 16}px` }} />
            <div className="bg-red-50 border-2 border-red-400 rounded" style={{ width: `${radio * 2 * 16}px`, height: `${altura * 12}px` }}>
              <p className="text-xs text-center mt-1 text-red-600">Lateral</p>
            </div>
            <div className="bg-red-100 border-2 border-red-400 rounded-full" style={{ width: `${radio * 16}px`, height: `${radio * 16}px` }} />
            <p className="text-xs text-gray-500">Red desplegada</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-red-50 rounded p-2">
            <strong>A. Lateral</strong><br />{areaLateral.toFixed(2)}
          </div>
          <div className="bg-red-50 rounded p-2">
            <strong>A. Base</strong><br />{areaBase.toFixed(2)}
          </div>
          <div className="bg-red-100 rounded p-2">
            <strong>A. Total</strong><br />{areaTotal.toFixed(2)}
          </div>
        </div>
      </InteractiveBox>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

function PrismaSection() {
  const quizQuestions = [
    {
      question: "Un prisma rectangular tiene dimensiones 2×3×4. ¿Cuál es el área lateral?",
      options: ["24", "40", "52", "28"],
      correctAnswer: 1,
      hint: "Perímetro base = 2(2+3) = 10. A_L = 10 × 4 = 40",
      reminder: "Área lateral = perímetro de la base × altura."
    },
    {
      question: "¿Cuántas caras tiene un prisma pentagonal?",
      options: ["5", "6", "7", "10"],
      correctAnswer: 2,
      hint: "Fórmula: C = n + 2. Para pentágono, n=5 → C = 5 + 2 = 7",
      reminder: "Un prisma de n lados tiene n caras laterales + 2 bases = n + 2 caras total."
    },
    {
      question: "Un prisma triangular tiene 6 vértices. ¿Cuántas aristas tiene?",
      options: ["6", "9", "12", "15"],
      correctAnswer: 1,
      hint: "Fórmula: A = 3n. Para triángulo, n=3 → A = 3×3 = 9",
      reminder: "Prisma de n lados: Vértices = 2n, Aristas = 3n, Caras = n + 2."
    }
  ]

  return (
    <TopicCard title="El Prisma" icon="📦" color="bg-bloque5">
      <WhySection>
        Estás diseñando una caja para guardar tus controles de videojuego.
        <br />
        Necesitas calcular exactamente cuánto cartón usar para no desperdiciar material.
        <br />
        Los prismas están en todas partes: cajas, casas, edificios, contenedores.
      </WhySection>

      <CommonMistakes
        mistakes={[
          "Confundir prisma rectangular con prisma cuadrado — el rectangular tiene bases rectangulares, no cuadradas.",
          "Olvidar que el área total incluye las DOS bases, no solo una.",
          "Calcular mal el perímetro de la base para el área lateral."
        ]}
      />

      <p className="text-sm text-gray-600 mb-4">
        Un <GlossaryTerm term="Prisma" definition="Cuerpo geométrico con dos bases poligonales iguales y paralelas unidas por caras rectangulares">prisma</GlossaryTerm> es un cuerpo 3D con dos <strong>bases iguales y paralelas</strong> 
        (pueden ser triángulos, cuadrados, pentágonos, etc.) unidas por rectángulos.
        Una caja de zapatos es un prisma rectangular. Un Toblerone es un prisma triangular.
      </p>

      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <p className="font-semibold text-red-800 mb-2">Fórmulas del prisma:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="bg-white rounded p-3 text-center">
            <p className="font-bold">Área Lateral</p>
            <MathTex expr={"A_L = \\text{Perímetro base} \\times h"} />
          </div>
          <div className="bg-white rounded p-3 text-center">
            <p className="font-bold">Área Total</p>
            <MathTex expr={"A_T = A_L + 2 \\times A_{\\text{base}}"} />
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-lg p-4 border">
        <p className="font-semibold mb-3">Datos importantes según el tipo de prisma:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-red-100">
                <th className="px-3 py-2 text-left">Prisma</th>
                <th className="px-3 py-2 text-center">Vértices</th>
                <th className="px-3 py-2 text-center">Aristas</th>
                <th className="px-3 py-2 text-center">Caras</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Triangular', 6, 9, 5],
                ['Rectangular', 8, 12, 6],
                ['Pentagonal', 10, 15, 7],
                ['Hexagonal', 12, 18, 8],
              ].map(([nombre, v, a, c]) => (
                <tr key={nombre} className="border-t">
                  <td className="px-3 py-2 font-medium">{nombre}</td>
                  <td className="px-3 py-2 text-center">{v}</td>
                  <td className="px-3 py-2 text-center">{a}</td>
                  <td className="px-3 py-2 text-center">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 bg-red-50 rounded p-3 text-sm">
          <p className="font-semibold">Fórmulas generales para un prisma de n lados:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><strong>Vértices</strong>: <MathTex expr={"V = 2n"} /></li>
            <li><strong>Aristas</strong>: <MathTex expr={"A = 3n"} /></li>
            <li><strong>Caras</strong>: <MathTex expr={"C = n + 2"} /></li>
          </ul>
          <p className="text-xs text-gray-500 mt-1">Ejemplo: Prisma pentagonal (n=5) → V=10, A=15, C=7</p>
        </div>
      </div>

      <MiniQuiz questions={quizQuestions} />
    </TopicCard>
  )
}

export default function Bloque5() {
  const totalTemas = 4

  return (
    <div>
      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-2">Bloque 5</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Geometría y Trigonometría</h1>
        <p className="text-gray-500 mt-2">Pitágoras, seno, coseno, tangente, cilindro y prisma</p>
      </div>

      <BlockProgress current={1} total={totalTemas} blockName="Bloque 5: Geometría" />

      <PitagorasSection />
      
      <BlockProgress current={2} total={totalTemas} blockName="Bloque 5: Geometría" />
      
      <TrigonometriaSection />
      
      <BlockProgress current={3} total={totalTemas} blockName="Bloque 5: Geometría" />
      
      <CilindroSection />
      
      <BlockProgress current={4} total={totalTemas} blockName="Bloque 5: Geometría" />
      
      <PrismaSection />

      <ExpressSummary color="bg-red-500">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <p className="font-bold text-red-800 text-sm">📐 Teorema de Pitágoras</p>
            <p className="text-xs text-gray-600 mt-1">a² + b² = c² (solo triángulos rectángulos)</p>
            <p className="text-xs text-red-500">c es la hipotenusa (lado más largo, frente al ángulo de 90°)</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <p className="font-bold text-red-800 text-sm">📏 Trigonometría SOH-CAH-TOA</p>
            <p className="text-xs text-gray-600 mt-1">sen(α) = opuesto/hipotenusa</p>
            <p className="text-xs text-gray-600">cos(α) = adyacente/hipotenusa</p>
            <p className="text-xs text-gray-600">tan(α) = opuesto/adyacente</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <p className="font-bold text-red-800 text-sm">🥫 Cilindro</p>
            <p className="text-xs text-gray-600 mt-1">A_L = 2πrh (superficie lateral)</p>
            <p className="text-xs text-gray-600">A_T = 2πrh + 2πr² (incluye tapas)</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <p className="font-bold text-red-800 text-sm">📦 Prisma de n lados</p>
            <p className="text-xs text-gray-600 mt-1">Vértices: 2n, Aristas: 3n, Caras: n + 2</p>
            <p className="text-xs text-gray-600">A_L = perímetro base × altura</p>
          </div>
        </div>
      </ExpressSummary>
    </div>
  )
}
