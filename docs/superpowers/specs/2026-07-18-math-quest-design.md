# Spec de diseño — Math Quest (repaso matemático gamificado para kidtopiaplay)

*Fecha: 2026-07-18. Estado: aprobado por Aurelio en sesión de brainstorming.*

## 1. Objetivo

Convertir la guía de estudio `math-review` (repaso remedial de 10mo) en **Math Quest**: un juego de repaso matemático general y gamificado para kidtopiaplay, con logros, niveles, vidas, preguntas tematizadas con videojuegos/cultura pop, y ejercicios de repaso enmascarados como sidequests.

## 2. Decisiones de alcance (acordadas)

| Decisión | Elección |
|---|---|
| Público / nivel | **Multi-nivel 8-15 años**: escalera desde aritmética básica hasta el contenido actual de 10mo |
| Integración con kidtopiaplay | **SPA independiente enlazada** desde el portal (ruta o subdominio); repos separados, sin estado compartido. Mientras el portal no exista, `kidtopiaplay.com` sigue apuntando directo a esta app como hoy |
| Persistencia | **localStorage + código de exportación** (sin backend, sin cuentas, sin datos personales) |
| Modo estudio actual | **Todo dentro del juego**: las lecciones se convierten en flujo del juego (briefings de nivel) |
| Tipo de preguntas | **Solo matemáticas tematizadas**: los videojuegos/cultura pop son contexto narrativo, no trivia real |
| Forma del juego | **Mapa de Mundos** (enfoque A): mundos por dominio matemático, niveles + jefe + sidequests |
| Idioma | Español |

**Fuera de alcance:** backend, cuentas, leaderboards, multijugador, trivia no matemática, compras.

## 3. Estructura del juego

### 3.1 Mundos (escalera 8→15 años)

| # | Mundo | Contenido | Origen |
|---|-------|-----------|--------|
| 1 | 🏝️ Isla Numérica | Operaciones básicas, orden, múltiplos y divisores | nuevo |
| 2 | 🍕 Reino de las Fracciones | Fracciones, decimales, porcentajes | nuevo |
| 3 | 🌋 Volcán de las Potencias | Aproximación/error, potencias, notación científica, radicales | Bloque 1 |
| 4 | 🏰 Castillo del Álgebra | MCD/MCM, polinomios, fracciones algebraicas, ecuaciones lineales | Bloques 2 + 4 (parte) |
| 5 | 🌀 Laberinto de Sistemas | Sistemas 2×2: gráfico, reducción, Cramer | Bloque 3 |
| 6 | 🚀 Estación de Funciones | Funciones lineales y cuadráticas | Bloque 4 |
| 7 | ⛰️ Montañas de Geometría | Pitágoras, trigonometría, cilindro y prisma | Bloque 5 |
| 8 | 🎡 Feria de Datos | Estadística, conteo, permutaciones/combinaciones + probabilidad básica (nuevo nivel) | Bloque 6 |

### 3.2 Anatomía de un mundo

- **3-6 niveles principales**, uno por tema. Nivel = **briefing** (lección convertida en pasos cortos: explicación → widget interactivo → ejemplo; sin vidas) + **reto** (preguntas con vidas y estrellas).
- **1 jefe final** 🐉: examen mixto del mundo como batalla — responder bien golpea al jefe (barra de vida), fallar cuesta una vida propia. Derrotarlo desbloquea el siguiente mundo.
- **2-3 sidequests opcionales** 📋: ejercicios de repaso con narrativa gamer ("El streamer perdió sus stats — ayúdalo a calcular su K/D", "Reparte el botín del squad en partes iguales"). Sin vidas, dan XP y monedas extra.

### 3.3 Progresión entre mundos

Desbloqueo secuencial (derrotar al jefe), más **portal de teletransporte**: prueba corta opcional de dominio que permite saltar mundos ya dominados (un jugador de 14 años no arranca sumando). Aprobar el portal marca el mundo como "superado por portal" (sin estrellas; puede volver a por ellas).

## 4. Sistemas de gamificación

Basados en la investigación (ver `docs/research/2026-07-18-gamificacion-y-pop.md`): feedback inmediato + narrativa + niveles funcionan; castigos duros y leaderboards desmotivan.

- **XP y nivel de jugador**: XP por respuesta correcta (bonus: primera vez, sin pistas, racha de aciertos en el nivel). Títulos por nivel (Aprendiz → Explorador → Mago Numérico → … → Gran Maestro Matemático). Honorífico + desbloquea cosméticos.
- **Estrellas por nivel (1-3 ⭐)** según % de aciertos. Rejugable; las preguntas **se regeneran con números distintos** (plantillas parametrizadas), así rejugar es practicar, no memorizar.
- **Vidas ❤️×3 (suaves)**: solo en retos y jefes. Fallar = −1 vida; sin vidas = reiniciar el nivel con preguntas nuevas. **Sin esperas, sin perder XP ganado, nunca bloquean jugar otra cosa.** Briefings y sidequests no tienen vidas.
- **Logros 🎖️**: badges con guiños gamer — "Speedrunner" (<2 min), "Sin daño" (sin perder vidas), "Completionista" (todas las sidequests de un mundo), "New Game+" (3⭐ en todo un mundo), logros secretos.
- **Monedas 🪙**: se ganan jugando; compran **pistas** en retos y **cosméticos** (avatares emoji, marcos, títulos). Sin dinero real.
- **Racha diaria 🔥**: días jugados → bonus diario de monedas; perderla no castiga (se guarda el récord).
- **Cofres sorpresa 📦** al completar niveles/jefes: recompensa aleatoria (monedas/cosmético/pista).

## 5. Tematización del contenido

Dos capas de referencias pop:

- **Evergreen** (en plantillas de preguntas): Minecraft, Roblox, Fortnite, Free Fire, Mario, fútbol, pizza, creadores genéricos ("un youtuber", "una streamer").
- **De temporada** (`src/content/season.js`): lo viral del momento, concentrado en un único archivo refrescable cada pocos meses sin tocar el resto (nada de cifras con fecha tipo "TikTok tiene 15.6M de usuarios" fuera de ese archivo).

Ajuste de tono por mundo: los mundos 1-2 (8-11 años) usan referencias más infantiles; los 3-8 mantienen el tono teen actual.

## 6. Arquitectura técnica

**Stack sin cambios**: Vite + React 19 + Tailwind 4 + KaTeX + Mafs + Recharts + react-router. Sin backend.

```
src/
  content/
    worlds/mundo1-numeros.js …    # datos: mundo → niveles → pasos + reto + quests + jefe
    achievements.js               # definición de logros
    season.js                     # referencias pop de temporada
  engine/
    WorldMap.jsx                  # mapa de mundos con progreso real
    LevelPlayer.jsx               # briefing (pasos) + reto (preguntas + vidas + estrellas)
    QuestPlayer.jsx               # sidequests narrativas
    BossArena.jsx                 # jefe con barra de vida
    generators.js                 # plantillas de preguntas parametrizadas
  widgets/                        # los ~14 widgets actuales, registrados por id
  state/
    gameStore.js                  # Context + useReducer: XP, estrellas, vidas, logros, monedas, racha
    persistence.js                # localStorage versionado + export/import
```

- **Schema de nivel** (datos, no JSX): lista de pasos tipados — `{ type: 'text' | 'formula' | 'widget' | 'example' | 'quiz', ... }`. Los widgets se referencian por id (`widget: 'pitagoras-calc'`); el registro en `src/widgets/index.js` los resuelve.
- **Preguntas como plantillas**: función `(params) => pregunta` con rangos por dificultad y generación de distractores; las ~72 preguntas actuales se migran (parametrizadas donde tenga sentido, fijas donde no).
- **Guardado**: clave `mathquest-save-v1` + copia de respaldo de la última versión buena (restauración ante corrupción). Export/import: JSON → base64 con checksum, para mover el progreso entre dispositivos.
- **Rutas**: `/` (mapa), `/mundo/:id`, `/mundo/:id/nivel/:n`, `/mundo/:id/jefe`, `/quest/:id`, `/logros`, `/perfil`. Redirects `/bloqueN` → mundo equivalente. Añadir 404.
- **Limpiezas**: renombrar `Math` → `MathTex` (eliminar el wart `window.Math`); token de Cloudflare a `.env` fuera de git; corregir bugs de contenido (MCM horas/min en Bloque 2, pregunta de Cramer en Bloque 3, probabilidad ausente en Bloque 6).

### Manejo de errores

- Guardado corrupto → restaurar respaldo; si también falla, partida nueva con aviso.
- Import de código de guardado inválido → mensaje claro, no pisa la partida actual.
- Contenido: script de validación (dev/CI) — toda pregunta tiene `correctAnswer` válido, todo widget referenciado existe, todo mundo tiene jefe y ≥1 sidequest.

### Testing

Vitest para lógica del juego (curva de XP, guardado/restauración/export-import, generadores de preguntas y distractores, desbloqueo de logros) + el script de validación de contenido. Los componentes visuales se validan manualmente (no hay tests hoy; no se pretende cobertura de UI).

## 7. Fases

- **Fase 0 — Base segura**: token a `.env`, commit del trabajo pendiente, fix de bugs de contenido, `Math`→`MathTex`, `docs/` y `TODO.md`.
- **Fase 1 — Motor piloto**: gameStore + persistencia, schema de contenido, LevelPlayer, migrar el Mundo 3 (Volcán ← Bloque 1) como piloto conviviendo con las rutas viejas.
- **Fase 2 — Migración completa**: mundos 4-8, WorldMap reemplaza Home, redirects.
- **Fase 3 — Gamificación completa**: logros, monedas, cofres, tienda, racha, jefes y sidequests en todos los mundos. ← **MVP jugable**
- **Fase 4 — Contenido nuevo**: mundos 1-2, portal de teletransporte, `season.js`.
- **Fase 5 — Pulido**: export/import, animaciones/celebraciones, tests completos, README real.

## 8. Riesgos

- **Referencias pop caducan** → mitigado con `season.js` y evergreen en plantillas.
- **Contenido de primaria (mundos 1-2) es el mayor esfuerzo de redacción** → fase 4, no bloquea el MVP.
- **localStorage se pierde al borrar el navegador** → mitigado con export/import; documentar en el juego.
- **Alcance de "todo dentro del juego"**: convertir toda la prosa en briefings es trabajo considerable → la migración es mecánica gracias a la estructura uniforme de los bloques (patrón idéntico por tema).
