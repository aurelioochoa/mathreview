import RectaNumerica from './RectaNumerica'
import PizzaFracciones from './PizzaFracciones'
import PorcentajeBarra from './PorcentajeBarra'
import DivisoresExplorer from './DivisoresExplorer'
import JerarquiaPasos from './JerarquiaPasos'
import AproximacionExplorer from './AproximacionExplorer'
import PotenciaCalculadora from './PotenciaCalculadora'
import NotacionConversor from './NotacionConversor'
import RaizCalculadora from './RaizCalculadora'
import McdCalculadora from './McdCalculadora'
import McmCalculadora from './McmCalculadora'
import FraccionesEjemplo from './FraccionesEjemplo'
import SistemasGrafica from './SistemasGrafica'
import CramerCalculadora from './CramerCalculadora'
import PendienteOrdenada from './PendienteOrdenada'
import ParabolaExplorer from './ParabolaExplorer'
import PitagorasCalculadora from './PitagorasCalculadora'
import TrianguloInteractivo from './TrianguloInteractivo'
import CilindroCalculadora from './CilindroCalculadora'
import EstadisticaCalculadora from './EstadisticaCalculadora'
import BoxPlot from './BoxPlot'
import PermutacionesCalculadora from './PermutacionesCalculadora'
import CombinacionesCalculadora from './CombinacionesCalculadora'
import AtuendosEjemplo from './AtuendosEjemplo'
import { lazy } from 'react'

// Los laboratorios interactivos nuevos van en diferido: cada uno se descarga al
// abrir el paso del briefing que lo usa, no en el arranque. LevelPlayer los
// envuelve en <Suspense>. Los de antes siguen directos porque los Bloque*.jsx
// del modo estudio los importan tal cual.
const OperacionesVisual = lazy(() => import('./OperacionesVisual'))
const CuadriculaDecimal = lazy(() => import('./CuadriculaDecimal'))
const BalanzaEcuaciones = lazy(() => import('./BalanzaEcuaciones'))
const SimplificadorAlgebraico = lazy(() => import('./SimplificadorAlgebraico'))
const VerificadorSistema = lazy(() => import('./VerificadorSistema'))
const ReduccionPasos = lazy(() => import('./ReduccionPasos'))
const SimuladorProbabilidad = lazy(() => import('./SimuladorProbabilidad'))
const PrismaLab = lazy(() => import('./Laboratorio3D').then(m => ({ default: m.PrismaLab })))
const CilindroLab = lazy(() => import('./Laboratorio3D').then(m => ({ default: m.CilindroLab })))

export const widgets = {
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
  'operaciones-visual': OperacionesVisual,
  'cuadricula-decimal': CuadriculaDecimal,
  'balanza-ecuaciones': BalanzaEcuaciones,
  'simplificador-algebraico': SimplificadorAlgebraico,
  'verificador-sistema': VerificadorSistema,
  'reduccion-pasos': ReduccionPasos,
  'simulador-probabilidad': SimuladorProbabilidad,
  'prisma-3d': PrismaLab,
  'cilindro-3d': CilindroLab,
}
