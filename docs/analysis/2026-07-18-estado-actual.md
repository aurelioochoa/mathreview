# Análisis del estado actual — math-review

*Fecha: 2026-07-18. Análisis previo a la conversión en juego gamificado ("Math Quest") para kidtopiaplay.*

## Qué es hoy

SPA de repaso de matemáticas para el **examen remedial de 10mo grado** (Ecuador), en español, desplegada en `kidtopiaplay.com`. Guía de estudio interactiva: 6 bloques temáticos con explicaciones, widgets interactivos y mini-quizzes. No es un juego: no hay progreso real, ni XP, ni logros, ni persistencia.

## Stack

- Vite 8 + React 19 + react-router-dom 7 + Tailwind CSS 4
- KaTeX (fórmulas), Mafs (gráficas interactivas), Recharts (barras), lucide-react (iconos)
- Docker multi-stage (`serve -s dist`) + servicio `dev` + servicio `pdf` (genera PDF de la guía)
- Cloudflare Tunnel → `kidtopiaplay.com` (Makefile: `production` / `stop-production`)
- Sin tests, sin TypeScript, sin backend

## Inventario por bloque

| Bloque | Título | Temas | Preguntas | Widgets interactivos |
|--------|--------|-------|-----------|----------------------|
| 1 | Números Reales y Notación Científica | Aproximación/error, potencias, notación científica, radicales | 12 | Explorador de aproximación, calculadora de potencias, conversor a notación científica, calculadora de raíz n-ésima |
| 2 | Polinomios y Fracciones Algebraicas | MCD, MCM, fracciones algebraicas, operaciones | 12 | Calculadora MCD (factorización + Euclides), calculadora MCM, ejemplo paso a paso (slideshow 5 pasos) |
| 3 | Sistemas de Ecuaciones 2×2 | Método gráfico, reducción, Cramer | 9 | Graficador de sistemas (Mafs), walkthrough de reducción (6 pasos), calculadora de Cramer |
| 4 | Funciones Lineales y Cuadráticas | Sistemas (repaso), función lineal, ecuaciones lineales, función cuadrática | 12 | Explorador de recta (sliders m/b + Mafs), solver paso a paso, explorador de parábola (sliders a/b/c + vértice/raíces/discriminante) |
| 5 | Geometría y Trigonometría | Pitágoras, razones trigonométricas, cilindro, prisma | 12 | Calculadora Pitágoras + triángulo Mafs, slider de ángulo con sen/cos/tan en vivo, calculadora de cilindro + desarrollo (red) en CSS |
| 6 | Estadística y Probabilidad | Media/mediana/moda, percentiles/cuartiles, principio de conteo, permutaciones, combinaciones | 15 | Calculadora de tendencia central + barras Recharts, box plot (solo lectura), calculadoras P(n,r) y C(n,r), demo de conteo con emojis |

**Total: ~72 preguntas de quiz y ~14 widgets interactivos.** Las preguntas ya vienen tematizadas con Free Fire, Roblox/Robux, Minecraft, Spotify, TikTok y Bad Bunny.

## Componentes

**Ya commiteados:** `Layout` (nav + prev/next), `TopicCard` (tarjeta colapsable de tema), `InteractiveBox` (marco de widget), `Math` (KaTeX).

**Sin commitear (trabajo pendiente en el working tree):** `MiniQuiz` (opción múltiple de un intento, con hint y recordatorio al fallar), `WhySection` ("¿Para qué me sirve esto?"), `CommonMistakes` ("Trampas típicas"), `ExpressSummary` (resumen colapsable "modo pánico"), `GlossaryTerm` (tooltip de definición), `BlockProgress` (barra de progreso **estática** — current/total hardcodeados). También sin commitear: los 6 bloques reescritos con estos componentes, Home renovado, y el deploy por Cloudflare Tunnel.

## Hallazgos clave para la conversión

1. **Contenido incrustado en JSX.** Solo los quizzes (`{question, options[4], correctAnswer, hint, reminder}`) y algunos slideshows (`pasos`) son datos; todo lo demás (prosa, fórmulas, resúmenes) es JSX inline. La conversión a juego exige extraer el contenido a datos.
2. **No hay estado de juego.** `BlockProgress` es decorativo. Ninguna persistencia (ni localStorage). Cada sección de página maneja solo su `useState` local.
3. **Estructura muy uniforme.** Cada tema sigue el patrón `TopicCard → WhySection → CommonMistakes → prosa+GlossaryTerm → caja de fórmulas → InteractiveBox → MiniQuiz`, lo que hace viable una migración mecánica a un schema de datos.
4. **Widgets portables.** Cada widget es autocontenido (estado + lógica + markup en una función), extraíble a un registro `src/widgets/`.
5. **Wart `window.Math`.** El componente `Math` (KaTeX) sombrea el global `Math` de JS; todo el código numérico usa `window.Math`. Renombrar a `MathTex`.
6. **🔴 Token de Cloudflare en texto plano** en `docker-compose.yml` (servicio `tunnel`). Moverlo a `.env` (fuera de git) antes de commitear.
7. **Bugs de contenido:**
   - Bloque 2: ejemplo MCM dice "36 **minutos**" para eventos "cada 12 **horas**".
   - Bloque 3: primera pregunta del quiz de Cramer inconsistente (el sistema da D=−18 pero las opciones/hint apuntan a −6).
   - Bloque 6: se titula "Estadística y **Probabilidad**" pero no contiene probabilidad (solo estadística y conteo).
8. **Referencias con fecha de caducidad** en el contenido ("TikTok tiene 15.6 millones de usuarios en Ecuador", oyentes de Bad Bunny). Deben concentrarse en un archivo de temporada.
9. **Progreso hardcodeado por página** (`totalTemas = 4`), sin ruta 404, sin lazy loading.
