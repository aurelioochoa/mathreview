# Spec de diseño — Fase 3: Gamificación completa (→ MVP jugable)

*Fecha: 2026-07-22. Estado: aprobado por Aurelio en sesión de brainstorming.*
*Spec base: [2026-07-18-math-quest-design.md](2026-07-18-math-quest-design.md) (§3.2, §4). Continúa la Fase 2 (migración completa de Mundos 3-8).*

## 1. Objetivo

Cerrar el bucle de juego de Math Quest añadiendo las capas de gamificación que faltan sobre el motor data-driven ya existente: **jefes** por mundo, **sidequests** narrativas, **logros**, **economía de monedas** (cofres + tienda de cosméticos + pistas compradas) y **racha diaria + perfil**. Al terminar la Fase 3, el juego es un **MVP jugable** completo: se puede progresar, dominar mundos, coleccionar, personalizar y volver cada día.

**Sin backend, sin cuentas, sin dependencias nuevas, sin TypeScript, todo en español, solo localStorage.** (Constraints heredadas de Fases 1-2.)

## 2. Decisiones acordadas (brainstorming)

| Decisión | Elección |
|---|---|
| Estructura del trabajo | **Un solo spec de Fase 3**; el plan se ejecuta **en capas por dependencias** (A→F, §9). |
| Regla de monedas | **Pago por estrellas nuevas**: al completar un nivel, monedas = `(estrellas_nuevas − mejor_previa) × COINS_PER_STAR` cuando es positivo, más un bono de primer completado. Rejugar sin mejorar la marca de estrellas paga 0. Jefes, sidequests y cofres son las fuentes principales de monedas. |
| Jefes | **Capstone con mapa abierto**: el jefe aparece al completar todos los niveles del mundo; derrotarlo da monedas grandes + un cofre + una **estrella de maestría** del mundo. El mapa sigue abierto (sin puerta dura al siguiente mundo; el portal de salto es Fase 4). |
| Sidequests | **Preguntas nuevas bespoke**: 2-3 sidequests por mundo, cada una con 3-5 preguntas nuevas a medida y narrativa gamer propia. |

## 3. Modelo de estado y persistencia (la base — todo lo demás se apoya aquí)

### 3.1 `state/gameStore.js` — estado ampliado

El estado crece de `{ version, xp, coins, stars, completedLevels }` a:

```js
{
  version: 2,
  xp: 0,
  coins: 0,
  stars: {},              // levelKey -> 1..3 (mejor marca; ya topado con Math.max)
  completedLevels: [],    // levelKey[]
  bossDefeats: [],        // worldId[]  — maestría de mundo
  questsCompleted: [],    // questKey[] (`mundoN/quest-id`)
  achievements: [],       // achievementId[] desbloqueados
  hints: 0,               // tokens de pista (de cofres / tienda)
  cosmetics: {
    owned: ['avatar-default'],
    avatar: 'avatar-default',   // equipado
    frame: null,                // equipado (null = sin marco)
    title: null,                // equipado (null = título automático por nivel de xpCurve)
  },
  streak: { count: 0, best: 0, lastDate: null },  // lastDate = 'YYYY-MM-DD' local
}
```

**Insight clave de la economía:** `stars` ya guarda la **mejor marca** por nivel (se topa con `Math.max`). Por tanto la regla "pago por estrellas nuevas" es una cuenta pura dentro del reducer: en `LEVEL_COMPLETED`, `const previaRaw = stars[levelKey]` (puede ser `undefined`); `primeraVez = previaRaw === undefined`; `previa = previaRaw ?? 0`; `delta = max(0, nuevas − previa)`; `coins += delta × COINS_PER_STAR + (primeraVez ? BASE_FIRST_CLEAR : 0)`. Como todo completado otorga ≥1 estrella, `primeraVez` equivale a "nunca antes completado". No hace falta guardar una estructura extra de "mejor marca".

**Constantes** (en `gameStore.js`): `COINS_PER_STAR = 10`, `BASE_FIRST_CLEAR = 15`, `COINS_BOSS = 60`, `COINS_QUEST = 25`, `XP_BOSS = 120`, `XP_QUEST = 40`.

**Nuevas acciones del reducer** (puras, cada una devuelve estado nuevo; los efectos de logros/cofres se calculan aparte y se despachan):
- `LEVEL_COMPLETED` (modificar): aplicar la regla de estrellas nuevas.
- `BOSS_DEFEATED { worldId, coins, xp }`: añade `worldId` a `bossDefeats` (dedup), suma coins/xp.
- `QUEST_COMPLETED { questKey, coins, xp }`: añade a `questsCompleted` (dedup), suma coins/xp.
- `OPEN_CHEST { reward }`: aplica una recompensa ya calculada (`{ type:'coins'|'hint'|'cosmetic', ... }`).
- `BUY_ITEM { item }`: valida coins suficientes; descuenta; añade a `cosmetics.owned` o incrementa `hints`.
- `EQUIP_COSMETIC { slot, id }`: cambia `cosmetics[slot]` si está en `owned`.
- `USE_HINT`: `hints = max(0, hints − 1)`.
- `TICK_STREAK { today, bonus }`: aplica `nextStreak` + suma el bono diario (idempotente por día).
- `UNLOCK_ACHIEVEMENTS { ids }`: une ids nuevos a `achievements` (dedup).

Todas las acciones deben ser **defensivas ante campos ausentes** (por si un save v1 recién migrado llega sin algún campo) usando defaults.

### 3.2 `state/persistence.js` — migración v1 → v2

- `migrate(data)`: si `data.version === 1`, devuelve `{ ...defaults, ...data, version: 2 }` rellenando los campos nuevos con sus valores por defecto (§3.1). Si ya es v2, se valida forma y se completan defaults ausentes.
- `loadSave`: acepta **v1 (migrando)** y **v2**. `SAVE_KEY`/`BACKUP_KEY` se conservan (`mathquest-save-v1` como clave física; la migración vive en el contenido, no en el nombre de la clave — evita perder saves existentes). El `version: 2` va dentro del JSON.
- `persistSave`: sin cambios de lógica (backup de la última versión buena + try/catch de quota).
- `initialState` y los defaults de migración deben compartir una única fuente (`defaultState()` en `gameStore.js`) para no divergir.

## 4. Jefes — `engine/BossArena.jsx`

- **Datos:** cada objeto de mundo (`content/worlds/mundoN-*.jsx`) gana un campo `boss: { name, emoji, intro }`. Ej.: Mundo 3 → `{ name: 'Ígneo, Señor del Magma', emoji: '🐲', intro: 'El volcán ruge…' }`. **La pila de preguntas del jefe = todas las fábricas `reto` de los niveles del mundo**, mezcladas y parametrizadas (reutiliza el contenido existente, cero preguntas nuevas).
- **Mecánica:** vida del jefe = `BOSS_QUESTIONS = 8` preguntas; cada acierto le hace daño (barra de vida decreciente), cada fallo cuesta una de las `BOSS_LIVES = 5` vidas del jugador. Sin vidas → "el jefe te venció", reintentar con preguntas nuevas (regenera con `attempt`, como `LevelPlayer`). Derrota → `BOSS_DEFEATED` + `COINS_BOSS` + `XP_BOSS` + un **cofre** + **estrella de maestría** (el nodo del mundo muestra ⭐ de maestría).
- **Acceso:** en `WorldView`, el jefe aparece (desbloqueado) solo cuando **todos** los niveles del mundo están en `completedLevels`; si no, se muestra bloqueado 🔒. Ruta `/mundo/:slug/jefe`. Reutiliza `Celebration` 3D en la victoria (gateado por device-tier como hoy).
- **Helper puro:** `buildBossPool(world, pick, rng)` en `engine/generators.js` (o en `BossArena` si es trivial) que aplana todas las fábricas de los niveles y devuelve `pick` preguntas barajadas vía `buildReto`.

## 5. Sidequests — `engine/QuestPlayer.jsx`

- **Datos:** nuevos archivos `content/quests/mundoN-quests.jsx` (2-3 quests por mundo). Schema por quest:
  ```js
  { id, title, emoji, npc, intro, outro, questions: factory[] }  // 3-5 fábricas bespoke
  ```
  Las preguntas son **nuevas a medida** con narrativa gamer (p. ej. "El streamer perdió sus stats — recalcula su K/D con estos datos"), pueden mezclar temas del mundo. Usan `makeOptions`/`staticQuestion` como el resto.
- **Índice:** `content/quests/index.js` exporta `questsForWorld(worldId) → quest[]` y `findQuest(worldId, questId)`.
- **Mecánica:** **sin vidas**; una respuesta incorrecta solo vuelve a preguntar (muestra hint/reminder). Al terminar todas las preguntas → `QUEST_COMPLETED { questKey: 'mundoN/quest-id' }` + `COINS_QUEST` + `XP_QUEST` (sin estrellas). Rejugar una quest ya completada no vuelve a pagar (dedup en `questsCompleted`; se puede rejugar por práctica, monedas 0).
- **Acceso:** listadas en `WorldView` bajo los niveles. Ruta `/mundo/:slug/quest/:questId`.

## 6. Economía — monedas, cofres, tienda, pistas

### 6.1 Monedas
Regla de §2/§3.1. `COINS_PER_STAR = 10`, primer completado `+15`, jefe `+60`, quest `+25`, bono diario de racha 5-20 (§8), cofres variable.

### 6.2 Cofres — `engine/Chest.jsx` + `engine/chests.js`
- `rollChest(state, rng) → reward` **puro**: tabla ponderada → `coins` (común, p. ej. 15-40), `hint` token (medio), o un **cosmético no poseído** (raro; si todos poseídos, cae a coins). Nunca entrega un cosmético duplicado.
- Se otorgan: al **primer** completado de un nivel, al derrotar un jefe, y en hitos de racha (§8). El componente `Chest.jsx` muestra la animación de apertura y despacha `OPEN_CHEST { reward }`.

### 6.3 Tienda — `/tienda` + `content/shop.js`
- Catálogo `content/shop.js`: **avatares** emoji (~8), **marcos** (frames: bordes con gradiente, ~5), **títulos** alternativos (~4), y **tokens de pista** en paquetes (~20 coins c/u). Cada ítem: `{ id, slot: 'avatar'|'frame'|'title'|'hint', label, emoji/preview, price }`. Precios cosméticos 50-150.
- Página `pages/Shop.jsx` (o `engine/Shop.jsx`): muestra catálogo, lo poseído marcado, botón comprar (`BUY_ITEM`, deshabilitado sin coins). Equipar desde el perfil.

### 6.4 Pistas compradas
- En `LevelPlayer` (reto) y `BossArena`: botón **"💡 Pedir pista (1 token)"** **antes** de responder, que revela `q.hint` sin arriesgar vida; despacha `USE_HINT`. Deshabilitado con `hints === 0` (enlace a la tienda). **El reminder gratuito tras un fallo se conserva** (diseño amable para niños). Los tokens vienen de cofres y tienda.

## 7. Logros — `content/achievements.js` + `/logros`

- **Definición** `content/achievements.js`: lista de `{ id, name, emoji, description, secret?: bool, check(state, event) }`. `event` es opcional (`{ type, ...payload }`) para logros dependientes de un suceso puntual (p. ej. speedrun).
- **Motor puro** `state/achievements.js`: `evaluateAchievements(state, event) → string[]` (ids recién desbloqueados, excluyendo los ya en `state.achievements`). Se evalúa tras cada dispatch relevante en `GameProvider` (o en un helper `dispatchWithAchievements`) y despacha `UNLOCK_ACHIEVEMENTS`. Un **toast** anuncia el/los logros nuevos.
- **Página** `/logros` (`pages/Achievements.jsx`): rejilla de todos los logros; desbloqueados a color, bloqueados en gris; secretos como "???" hasta desbloquearse.
- **Lista (~18)**:
  - Por nivel: **Sin daño** (completar un reto sin perder vidas), **Speedrunner** (reto < 2 min — requiere un cronómetro ligero en `LevelPlayer`), **Perfeccionista** (3⭐ en un nivel).
  - Por mundo: **Completionista** (todas las sidequests de un mundo), **New Game+** (3⭐ en todos los niveles de un mundo), **Cazajefes** (primer jefe derrotado), **Maestro del Mundo** (jefe + 3⭐ + todas las quests de un mundo).
  - Global: **Racha de 3 / 7 / 30 días**, **Primera compra** (primer `BUY_ITEM`), **Coleccionista** (5 cosméticos poseídos), **Nivel 5 / 10 de jugador**, **Todos los mundos dominados**.
  - Secretos (2-3): p. ej. **Fénix** (ganar un jefe con 1 vida), **Ahorrador** (llegar a 500 monedas), **Explorador nocturno** (jugar de madrugada).

## 8. Racha diaria + Perfil

### 8.1 Racha — `state/streak.js`
- `nextStreak(streak, today) → streak'` **puro**: `today === lastDate` → sin cambio; `today === lastDate + 1 día` → `count + 1`; hueco mayor → `count = 1`. `best = max(best, count')`. `lastDate = today`.
- `dailyBonus(count) → coins`: escala 5→20 con la racha, topado (p. ej. `min(20, 5 + count × 2)`).
- **Disparo:** una sola vez al día, **al montar `GameProvider` (apertura de la app)** — `GameProvider` calcula `today` (Date real, local, `YYYY-MM-DD`) en un `useEffect` de montaje y despacha `TICK_STREAK` **solo si `today !== streak.lastDate`**. Al ser idempotente por día (`lastDate` se actualiza), reabrir la app el mismo día no vuelve a sumar. En hitos (3/7/30 días) también otorga un cofre. Perder la racha **nunca castiga** (se guarda `best`).
- Se muestra en el HUD (🔥N) y en el perfil.

### 8.2 Perfil — `/perfil` (`pages/Profile.jsx`)
- Muestra: **avatar** equipado + **marco** + **título** (equipado, o automático por nivel), **nivel de jugador**, XP, estrellas totales, monedas, **racha actual/récord**, **mundos dominados**, **logros desbloqueados** (n/total), **sidequests completadas**.
- Permite **equipar** cosméticos poseídos (`EQUIP_COSMETIC { slot, id }`) desde selectores por slot.

## 9. Arquitectura, rutas, HUD, testing

### 9.1 Estructura de archivos (nuevos / modificados)
```
src/
  state/
    gameStore.js        (mod: estado v2, constantes, acciones nuevas, defaultState())
    persistence.js      (mod: migrate v1→v2)
    achievements.js     (nuevo: evaluateAchievements)
    streak.js           (nuevo: nextStreak, dailyBonus)
    GameProvider.jsx    (mod: TICK_STREAK diario + dispatch con logros)
  engine/
    BossArena.jsx       (nuevo)
    QuestPlayer.jsx     (nuevo)
    Chest.jsx           (nuevo)
    chests.js           (nuevo: rollChest)
    generators.js       (mod: buildBossPool)
    WorldView.jsx       (mod: sección jefe + sidequests + estrella maestría)
  content/
    achievements.js     (nuevo)
    shop.js             (nuevo)
    quests/mundoN-quests.jsx  (nuevos, 6 archivos) + quests/index.js
    worlds/mundoN-*.jsx (mod: campo `boss`)
    validateContent.js  (mod: exige `boss` y ≥1 quest por mundo)
  pages/
    Achievements.jsx    (nuevo: /logros)
    Profile.jsx         (nuevo: /perfil)
    Shop.jsx            (nuevo: /tienda)
  components/
    Hud.jsx             (mod: 🔥 racha + accesos a perfil/tienda/logros)
    Toast.jsx           (nuevo: aviso de logro)
  App.jsx               (mod: rutas nuevas)
```

### 9.2 Rutas nuevas
`/logros`, `/perfil`, `/tienda`, `/mundo/:slug/jefe`, `/mundo/:slug/quest/:questId`.

### 9.3 HUD
Añade indicador 🔥 de racha y accesos (iconos) a perfil, tienda y logros, sin romper el layout responsive actual.

### 9.4 Testing (convención del proyecto: lógica pura + integración ligera; sin tests visuales de widgets)
- Reducer: cada acción nueva + la regla de estrellas nuevas (delta correcto en primer clear, mejora y rejugado sin mejora).
- `migrate` v1→v2 (rellena defaults; save v2 intacto; save corrupto → null).
- `rollChest` (nunca cosmético duplicado; cae a coins si todo poseído; forma de reward válida).
- `evaluateAchievements` (desbloquea el esperado por evento/estado; no re-desbloquea).
- `nextStreak` / `dailyBonus` (mismo día, día siguiente, hueco; bono topado).
- `buildBossPool` (agrega fábricas de todos los niveles; 4 opciones válidas en N tiradas).
- Fábricas de sidequests por mundo (4 opciones distintas, `correctAnswer` válido, 500 tiradas — espejo de los tests de mundos).
- `validateContent` extendido: todo mundo tiene `boss` bien formado y ≥1 quest; toda quest tiene 3-5 fábricas válidas.
- Integración ligera: `BossArena` y `QuestPlayer` renderizan y completan un flujo mínimo (espejo de los tests de integración de mundos).

### 9.5 Plan por capas (orden de dependencias)
- **A — Base:** estado v2 + `defaultState` + migración v1→v2 + regla de monedas por estrellas nuevas + tests. (Nada visible aún; fundamento de todo.)
- **B — Jefes:** `boss` en los 6 mundos + `buildBossPool` + `BossArena` + acceso en `WorldView` + estrella de maestría + ruta.
- **C — Sidequests:** `content/quests/*` (bespoke) + índice + `QuestPlayer` + acceso en `WorldView` + ruta + tests de fábricas.
- **D — Economía visible:** cofres (`rollChest` + `Chest.jsx`, enganchado a niveles/jefes) + tienda (`shop.js` + `/tienda`) + pistas compradas (botón en reto/jefe).
- **E — Logros:** `achievements.js` + motor + toast + `/logros` + wiring en `GameProvider`.
- **F — Racha + perfil:** `streak.js` + `TICK_STREAK` diario + HUD 🔥 + `/perfil` con equipado de cosméticos.

Cada capa termina con `npm test` + `npm run build` verdes y un commit propio.

## 10. Manejo de errores y riesgos

- **Save v1 en disco** → `migrate` lo actualiza a v2 sin pérdida; si el JSON está corrupto, se cae al backup y, en última instancia, a partida nueva (comportamiento actual conservado).
- **Compra sin monedas** → `BUY_ITEM` es no-op defensivo (el botón ya va deshabilitado); nunca deja coins negativas.
- **Cofre sin cosméticos disponibles** → `rollChest` degrada a monedas (no entrega duplicados ni ítems inexistentes).
- **Fecha del dispositivo** → la racha usa `Date` local; un reloj adelantado/atrasado solo afecta la racha del propio usuario (sin impacto en otros; sin backend). No se castiga perderla.
- **Contenido** → `validateContent` (dev/CI) garantiza que cada mundo tiene jefe y ≥1 sidequest y que toda fábrica produce preguntas válidas, evitando romper el juego por datos mal formados.
- **Carga de contenido bespoke** (14+ sidequests) → es el mayor esfuerzo de redacción; se aísla en `content/quests/*` y se puede paralelizar en la implementación.

## 11. Fuera de alcance (Fase 4+)

Portal de teletransporte (salto de mundos con prueba de dominio), Mundos 1-2 (contenido nuevo de primaria), `season.js`, export/import de partida (base64 + checksum), celebración específica de logro/jefe más allá de la reutilización de `Celebration`, tests de UI de widgets.
