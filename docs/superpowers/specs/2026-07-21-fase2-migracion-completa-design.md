# Spec de diseño — Fase 2: Migración completa (Mundos 4-8)

*Fecha: 2026-07-21. Estado: aprobado por Aurelio en sesión de brainstorming.*

Continúa el spec base [2026-07-18-math-quest-design.md](2026-07-18-math-quest-design.md) y el
rediseño 3D [2026-07-19-rediseno-worldmap-3d-design.md](2026-07-19-rediseno-worldmap-3d-design.md).
El Mundo 3 (🌋 Volcán de las Potencias ← Bloque 1) ya está migrado como piloto en la Fase 1.

## 1. Objetivo

Migrar el contenido de los Bloques 2-6 al motor de juego como Mundos 4-8 jugables (briefing + reto
por nivel), añadir el nivel nuevo de probabilidad, y convertir el mapa de mundos 3D en la puerta de
entrada real al juego (nodos 4-8 pasan de "estudio" a "juego"). Se conserva la prosa original como
"modo estudio" accesible, se añaden redirects y una ruta 404, y un script de validación de contenido.

**Fuera de alcance (queda para Fase 3):** jefes 🐉 (`BossArena`), sidequests 📋 (`QuestPlayer`),
logros, tienda, cofres y racha. Fase 2 es **solo migración de niveles** (briefing + reto).

## 2. Decisiones acordadas (brainstorming 2026-07-21)

| Decisión | Elección |
|---|---|
| Destino de las páginas `/bloqueN` | **Redirect + seguir accesibles**: `/bloqueN` redirige a su mundo; la prosa se conserva en una ruta de "modo estudio" enlazada desde cada mundo |
| Alcance del nivel de probabilidad (Mundo 8) | **Básica**: espacio muestral, P(evento) = casos favorables/posibles, complementario (1−P), eventos independientes (regla del producto) |
| Fidelidad de migración de preguntas | **Más parametrizado**: las preguntas computacionales se convierten en fábricas parametrizadas (números nuevos en cada rejugada); las conceptuales/definicionales se copian literales |

## 3. Mapa de Mundos → niveles

Origen por sección de cada Bloque (los nombres de sección son las funciones `*Section` de cada archivo).

| Mundo | Slug | Origen | Niveles (id → sección origen) |
|---|---|---|---|
| 4 🏰 Castillo del Álgebra | `castillo-algebra` | Bloque 2 + B4 `EcuacionesLineales` | `mcd` ← B2 MCDSection · `mcm` ← B2 MCMSection · `fracciones-algebraicas` ← B2 FraccionesAlgebraicasSection · `operaciones` ← B2 OperacionesSection · `ecuaciones-lineales` ← B4 EcuacionesLinealesSection |
| 5 🌀 Laberinto de Sistemas | `laberinto-sistemas` | Bloque 3 + B4 `SistemasLineales` | `intro-sistemas` ← B4 SistemasLinealesSection (on-ramp) · `metodo-grafico` ← B3 · `reduccion` ← B3 · `cramer` ← B3 MetodoCramer |
| 6 🚀 Estación de Funciones | `estacion-funciones` | Bloque 4 (funciones) | `funcion-lineal` ← B4 FuncionLinealSection · `funcion-cuadratica` ← B4 FuncionCuadraticaSection |
| 7 ⛰️ Montañas de Geometría | `montanas-geometria` | Bloque 5 | `pitagoras` ← B5 PitagorasSection · `trigonometria` ← B5 TrigonometriaSection · `cilindro` ← B5 CilindroSection · `prisma` ← B5 PrismaSection |
| 8 🎡 Feria de Datos | `feria-datos` | Bloque 6 + **nuevo** | `estadistica` ← B6 MediaMedianaModa · `percentiles` ← B6 PercentilesSection · `conteo` ← B6 PrincipioConteoSection · `permutaciones` ← B6 PermutacionesSection · `combinaciones` ← B6 CombinacionesSection · `probabilidad` ← **nuevo** |

Notas de mapeo:
- **Bloque 4 se reparte en tres mundos.** Su `SistemasLinealesSection` es un tratamiento introductorio
  (rectas paralelas, cuadrantes, plantear un sistema) → es el nivel 1 del Mundo 5, antes del
  gráfico/reducción/Cramer profundos del Bloque 3. `EcuacionesLinealesSection` → Mundo 4.
  `FuncionLinealSection` + `FuncionCuadraticaSection` → Mundo 6. El redirect de `/bloque4` apunta a
  su hogar primario, Mundo 6 (`estacion-funciones`).
- **Mundo 6 queda con 2 niveles** por ahora (es el contenido de funciones que existe); se acepta como
  válido (el spec base admite "3-6 niveles"; se puede ampliar en fases posteriores).
- `levelKey = 'mundoN/<levelId>'` (misma convención que el piloto: `mundo3/aproximacion`).
  Los `mundoN` numéricos se mantienen (`mundo4`…`mundo8`) para las claves; el `slug` es la ruta.

## 4. Modelo de contenido (idéntico al piloto Mundo 3)

Cada `src/content/worlds/mundoN-<tema>.jsx` exporta un objeto:

```
{ id: 'mundo4', slug: 'castillo-algebra', name, emoji, color, description,
  levels: [{ id, title, icon,
             briefing: [ {type:'why', body:<JSX>} | {type:'content', body:<JSX>}
                       | {type:'mistakes', items:[string]} | {type:'widget', widgetId, title} ],
             reto: { factories: [(rng)=>question], pick } }] }
```

- La prosa del briefing se migra de la sección equivalente del Bloque (WhySection → `why`,
  prosa/fórmulas → `content`, CommonMistakes → `mistakes`, InteractiveBox → `widget`).
- `src/content/worlds/index.js` agrega los nuevos mundos a `worlds = [mundo3, mundo4, …, mundo8]`.

## 5. Estrategia de preguntas — "más parametrizado"

Regla: **parametrizar lo computable, dejar estático lo conceptual.**

- **Fábricas parametrizadas** `(rng) => {question, options[4], correctAnswer, hint, reminder}` para
  preguntas con cálculo (MCD/MCM de un par, evaluar una potencia, resolver `x`, Pitágoras, área de
  cilindro, nPr/nCr, P(evento)…). Generan valores nuevos y distractores plausibles en cada llamada.
- **`staticQuestion(...)`** (copiadas literales del Bloque) para preguntas conceptuales/definicionales
  (cuadrantes, "si son paralelas ⇒ ¿?", definiciones, interpretación).
- **Helper compartido nuevo** en `engine/generators.js`:
  `shuffleAnswer(correct, distractors, rng) → { options, correctAnswer }` — arma las 4 opciones,
  baraja y devuelve el índice de la correcta. Elimina el patrón manual `correctAnswer: 0` frágil.
  Se añaden helpers de distractores donde se repita el patrón (p.ej. cerca-del-correcto ± delta).
- Las fábricas específicas de cada mundo viven **colocadas en el archivo del mundo** (como
  `potenciaDanio` en el piloto); solo los helpers genéricos van en `generators.js`.
- `buildReto(factories, pick, rng)` y `randInt` existentes se reutilizan sin cambios.

## 6. Widgets a extraer

Extraer el contenido interno de cada `InteractiveBox` de los Bloques 2-6 a `src/widgets/`, uno por
componente autocontenido, registrado por id en `widgets/index.js`. Los Bloques (modo estudio) siguen
usando los mismos widgets → sin duplicar lógica.

| Widget id | Origen |
|---|---|
| `mcd-calculadora` | B2 "Calculadora de MCD" |
| `mcm-calculadora` | B2 "Calculadora de MCM" |
| `fracciones-ejemplo` | B2 "Ejemplo paso a paso — Suma de fracciones" |
| `sistemas-grafica` | B3 "Gráfica interactiva — Mueve los coeficientes" |
| `cramer-calculadora` | B3 "Calculadora de Cramer" |
| `pendiente-ordenada` | B4 "Juega con la pendiente y la ordenada" |
| `parabola-explorer` | B4 "Explora la parábola" |
| `pitagoras-calculadora` | B5 "Calculadora de Pitágoras" |
| `triangulo-interactivo` | B5 "Triángulo interactivo — Cambia el ángulo" |
| `cilindro-calculadora` | B5 "Calculadora del cilindro" |
| `boxplot` | B6 "Diagrama de caja (Box Plot)" |
| `permutaciones-calculadora` | B6 "Calculadora de permutaciones" |
| `combinaciones-calculadora` | B6 "Calculadora de combinaciones" |
| `atuendos-ejemplo` | B6 "¿Cuántos atuendos puedes formar?" |

(Los "Ejemplo paso a paso" que son estáticos pueden migrarse como paso `content` en vez de widget si
no tienen estado interactivo; se decide por widget al extraer.)

## 7. Ruteo y modo estudio

Elección "redirect + seguir accesible":

- `App.jsx`:
  - Añadir `/mundo/:slug/estudio` → renderiza la página de Bloque correspondiente (prosa completa).
  - Cambiar `/bloqueN` a `<Navigate to="/mundo/:slug" replace />` (redirect por bloque).
  - Añadir ruta `*` → componente 404 (`NotFound`) con enlace al mapa.
- `WorldView` gana un enlace **"📖 Modo estudio"** → `/mundo/:slug/estudio`.
- Los componentes `BloqueN.jsx` **se conservan** (ahora se alcanzan por la ruta de estudio); no se
  borran. La resolución slug→Bloque vive en `worldMap.js` (`studyTarget`), fuente única.

## 8. Cambios en `worldMap.js` (fuente única del mapa)

- Nodos `castillo-algebra`, `laberinto-sistemas`, `estacion-funciones`, `montanas-geometria`,
  `feria-datos`: `mode: 'study'` → `mode: 'game'`, `target: '/bloqueN'` → `target: '/mundo/:slug'`,
  añadir `levelKeys: [...]` (para progreso/estrellas) y `studyTarget: '/mundo/:slug/estudio'`.
- **Fix de bug existente:** `MUNDO3_LEVELS` dice `['aproximacion','potencias','notacion','radicales']`
  pero los ids reales del Mundo 3 son `['aproximacion','potenciacion','notacion','radicacion']`, así
  que el mapa 3D hoy **subcuenta** estrellas/completado del Mundo 3. Corregir los dos ids.
- El progreso (`worldProgress`, `nodeState`) ya es genérico por `levelKeys`; no cambia su lógica.

## 9. Script de validación de contenido

`scripts/validate-content.mjs` + envoltorio Vitest para que corra en `npm test` y CI. Verifica:

1. Toda pregunta (ejecutando cada fábrica) tiene exactamente 4 `options` y `correctAnswer` en 0-3.
2. Todo `widgetId` referenciado en un briefing existe en el registro `widgets`.
3. Todo mundo tiene `id`, `slug` único y ≥1 nivel; todo nivel tiene `id` único dentro del mundo.
4. Todo `levelKeys` de `worldMap.js` corresponde a un `mundoN/<levelId>` real (**habría detectado el
   bug del Mundo 3**).
5. Todo nodo del mapa con `mode:'game'` tiene `levelKeys`; todo `studyTarget`/`target` es una ruta
   conocida.

## 10. Testing

- **TDD** sobre lógica pura: el helper `shuffleAnswer` (barajado correcto, índice consistente) y las
  fábricas parametrizadas de cada mundo (correctAnswer válido, 4 opciones, distractores distintos del
  correcto, resultado matemáticamente correcto para semillas fijas).
- Tests del propio script de validación (detecta un mundo inválido de fixture).
- Un test de integración ligero por mundo nuevo (espejo de `mundo3-integracion.test.jsx`): renderiza
  `LevelPlayer`, avanza el briefing y responde el reto.
- `npm test && npm run build` verdes al final.

## 11. Entrega

Un plan de implementación, ejecutado **por mundo** (extraer widgets → helpers/fábricas con TDD →
archivo de contenido → registrar en `index.js` → smoke test → commit), y luego los cambios
transversales (ruteo, `worldMap.js`, 404, script de validación). Commit por mundo para revisar
incrementalmente. Opcionalmente (ultracode), las cinco migraciones casi idénticas pueden repartirse
en subagentes en paralelo con aislamiento y reconciliarse; por defecto es secuencial.

## 12. Riesgos

- **Deriva de contenido al parametrizar:** una fábrica mal escrita puede generar una pregunta con
  respuesta incorrecta. Mitigado con TDD por fábrica (verificar la matemática con semillas fijas) y el
  script de validación.
- **Doble fuente de verdad prosa vs briefing:** la prosa vive en el Bloque (modo estudio) y un resumen
  en el briefing del nivel; pueden divergir. Aceptado: el briefing es una versión condensada, no una
  copia; el modo estudio es la referencia completa.
- **`/bloque4` redirige a un solo mundo** aunque su contenido se reparte en tres; se elige Mundo 6 como
  destino. Riesgo bajo (los enlaces internos apuntan a los mundos correctos).
