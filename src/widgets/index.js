import { lazy } from 'react'

// Cada actividad se carga solo al abrirla; las gráficas no pesan en el mapa.
const RectaNumerica = lazy(() => import('./RectaNumerica'))
const PizzaFracciones = lazy(() => import('./PizzaFracciones'))
const PorcentajeBarra = lazy(() => import('./PorcentajeBarra'))
const DivisoresExplorer = lazy(() => import('./DivisoresExplorer'))
const JerarquiaPasos = lazy(() => import('./JerarquiaPasos'))
const AproximacionExplorer = lazy(() => import('./AproximacionExplorer'))
const PotenciaCalculadora = lazy(() => import('./PotenciaCalculadora'))
const NotacionConversor = lazy(() => import('./NotacionConversor'))
const RaizCalculadora = lazy(() => import('./RaizCalculadora'))
const McdCalculadora = lazy(() => import('./McdCalculadora'))
const McmCalculadora = lazy(() => import('./McmCalculadora'))
const FraccionesEjemplo = lazy(() => import('./FraccionesEjemplo'))
const SistemasGrafica = lazy(() => import('./SistemasGrafica'))
const CramerCalculadora = lazy(() => import('./CramerCalculadora'))
const PendienteOrdenada = lazy(() => import('./PendienteOrdenada'))
const ParabolaExplorer = lazy(() => import('./ParabolaExplorer'))
const PitagorasCalculadora = lazy(() => import('./PitagorasCalculadora'))
const TrianguloInteractivo = lazy(() => import('./TrianguloInteractivo'))
const CilindroCalculadora = lazy(() => import('./CilindroCalculadora'))
const EstadisticaCalculadora = lazy(() => import('./EstadisticaCalculadora'))
const BoxPlot = lazy(() => import('./BoxPlot'))
const PermutacionesCalculadora = lazy(() => import('./PermutacionesCalculadora'))
const CombinacionesCalculadora = lazy(() => import('./CombinacionesCalculadora'))
const AtuendosEjemplo = lazy(() => import('./AtuendosEjemplo'))

const CountingLab = lazy(() => import('./ConceptLabs').then(module => ({ default: module.CountingLab })))
const FractionsLab = lazy(() => import('./ConceptLabs').then(module => ({ default: module.FractionsLab })))
const PowersLab = lazy(() => import('./ConceptLabs').then(module => ({ default: module.PowersLab })))
const AlgebraLab = lazy(() => import('./ConceptLabs').then(module => ({ default: module.AlgebraLab })))
const SystemsLab = lazy(() => import('./ConceptLabs').then(module => ({ default: module.SystemsLab })))
const FunctionsLab = lazy(() => import('./ConceptLabs').then(module => ({ default: module.FunctionsLab })))
const GeometryLab = lazy(() => import('./ConceptLabs').then(module => ({ default: module.GeometryLab })))
const ProbabilityLab = lazy(() => import('./ConceptLabs').then(module => ({ default: module.ProbabilityLab })))

export const widgets = {
  'concept-counting': CountingLab,
  'concept-fractions': FractionsLab,
  'concept-powers': PowersLab,
  'concept-algebra': AlgebraLab,
  'concept-systems': SystemsLab,
  'concept-functions': FunctionsLab,
  'concept-geometry': GeometryLab,
  'concept-probability': ProbabilityLab,
  'recta-numerica': RectaNumerica,
  'pizza-fracciones': PizzaFracciones,
  'porcentaje-barra': PorcentajeBarra,
  'divisores-explorer': DivisoresExplorer,
  'jerarquia-pasos': JerarquiaPasos,
  'aproximacion-explorer': AproximacionExplorer,
  'potencia-calculadora': PotenciaCalculadora,
  'notacion-conversor': NotacionConversor,
  'raiz-calculadora': RaizCalculadora,
  'mcd-calculadora': McdCalculadora,
  'mcm-calculadora': McmCalculadora,
  'fracciones-ejemplo': FraccionesEjemplo,
  'sistemas-grafica': SistemasGrafica,
  'cramer-calculadora': CramerCalculadora,
  'pendiente-ordenada': PendienteOrdenada,
  'parabola-explorer': ParabolaExplorer,
  'pitagoras-calculadora': PitagorasCalculadora,
  'triangulo-interactivo': TrianguloInteractivo,
  'cilindro-calculadora': CilindroCalculadora,
  'estadistica-calculadora': EstadisticaCalculadora,
  'boxplot': BoxPlot,
  'permutaciones-calculadora': PermutacionesCalculadora,
  'combinaciones-calculadora': CombinacionesCalculadora,
  'atuendos-ejemplo': AtuendosEjemplo,
}
