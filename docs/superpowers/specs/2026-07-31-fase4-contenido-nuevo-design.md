# Spec de diseño — Fase 4: Contenido nuevo (Mundos 1-2, portal y temporada)

> Fase anterior: [Fase 3 — Gamificación completa](2026-07-22-fase3-gamificacion-design.md) (cerrada, MVP jugable).
> Spec base: [Math Quest](2026-07-18-math-quest-design.md) §3.1 (escalera de mundos), §3.3 (portal), §5 (temporada).

## 1. Objetivo

Completar la escalera **8 → 15 años** que promete la spec base. Hoy el juego arranca en el Mundo 3 🌋, escrito para 10mo: un niño de 8 años no tiene por dónde entrar. Esta fase añade los dos mundos iniciales, la progresión entre mundos con su vía de escape para jugadores mayores, y el archivo de referencias de temporada.

Al cerrar la fase, el mapa tiene **8 mundos jugables** y un jugador de cualquier edad del rango tiene una entrada natural: los pequeños por el Mundo 1, los mayores saltando con el portal.

## 2. Decisiones acordadas (brainstorming)

| Tema | Decisión |
|---|---|
| Alcance | Fase 4 completa: Mundo 1 + Mundo 2 + portal + `season.js` |
| Desbloqueo entre mundos | **Se implementa ahora**, junto al portal — sin puerta, el portal no abre nada |
| Partidas existentes | **Grandfathering por progreso**, no migración de datos: quien ya jugaba nunca se topa con una puerta nueva |
| Modo estudio en Mundos 1-2 | **No existe**: no vienen de ningún Bloque. El enlace se oculta |
| Orden de trabajo | `season.js` primero, para que el contenido nuevo lo use desde el inicio |
| Maestría | La ⭐ de maestría sigue siendo **solo del jefe**. El portal abre paso, no da estrellas |

## 3. Tono para 8-11 años

Territorio nuevo: los Mundos 3-8 son tono teen y no sirven de plantilla de voz. Reglas para los Mundos 1-2:

- **Una idea por frase.** Enunciados cortos, sin subordinadas encadenadas.
- **Sin notación algebraica**: nada de `x`, ni exponentes, ni fórmulas con letras. KaTeX solo para fracciones y operaciones con números.
- **Números manejables**: Mundo 1 trabaja con resultados ≤ 1000 y divisiones exactas. Decimales solo aparecen en el Mundo 2 (y como dinero o medidas, no abstractos).
- **Referencias**: Minecraft, Roblox, Mario, Pokémon, fútbol, pizza, cromos, mascotas. **Se evitan** shooters (Fortnite, Free Fire) y streamers concretos, que sí usan los mundos teen.
- **Nada de castigo verbal**: los `mistakes` del briefing se redactan como "ojo con esto", no como "error grave".
- Emoji generoso en títulos y NPCs; el vocabulario matemático correcto se introduce con `GlossaryTerm`, como en el resto del juego.

## 4. Mundo 1 — 🏝️ Isla Numérica

`src/content/worlds/mundo1-numeros.jsx` · id `mundo1` · slug `isla-numerica` · tema `world-isla` (token ya definido).

| # | Nivel | id | Contenido | Widget |
|---|---|---|---|---|
| 1 | 🐚 Operaciones básicas | `operaciones` | Suma, resta, multiplicación y división exacta con números pequeños | — |
| 2 | 📏 Ordenar números | `orden` | Comparar (`<`, `>`, `=`), ordenar listas, recta numérica | `recta-numerica` (nuevo) |
| 3 | 🔢 Múltiplos y divisores | `multiplos-divisores` | Múltiplos, divisores, qué es un número primo | `divisores-explorer` (nuevo) |
| 4 | 🧮 Jerarquía de operaciones | `jerarquia` | Paréntesis primero, luego × ÷, luego + − | `jerarquia-pasos` (nuevo) |

- **Jefe**: `{ name: 'El Kraken Contador', emoji: '🐙', intro: 'El Kraken no deja salir de la isla a quien no domine sus números.' }`
- **Sidequests** (`mundo1-quests.jsx`): `isla-quest-1` "El tesoro repartido" (NPC: Pirata Coco 🥥 — reparto exacto y división) e `isla-quest-2` "El faro de la isla" (NPC: Farera Luna 🌙 — orden y múltiplos).

## 5. Mundo 2 — 🍕 Reino de las Fracciones

`src/content/worlds/mundo2-fracciones.jsx` · id `mundo2` · slug `reino-fracciones` · tema `world-reino`.

| # | Nivel | id | Contenido | Widget |
|---|---|---|---|---|
| 1 | 🍕 Qué es una fracción | `fracciones` | Leer fracciones, numerador/denominador, equivalentes | `fracciones-ejemplo` (existe) |
| 2 | ➕ Sumar y restar fracciones | `operar-fracciones` | Igual denominador, y distinto con denominadores pequeños | `pizza-fracciones` (nuevo) |
| 3 | 🔟 Decimales | `decimales` | Fracción ↔ decimal, décimas y centésimas | — |
| 4 | 💯 Porcentajes | `porcentajes` | Porcentaje de una cantidad, descuentos | `porcentaje-barra` (nuevo) |

- **Jefe**: `{ name: 'El Chef Mitades', emoji: '👨‍🍳', intro: 'El Chef parte todo por la mitad y reta a quien no sepa juntar los trozos otra vez.' }`
- **Sidequests** (`mundo2-quests.jsx`): `reino-quest-1` "La pizzería del reino" (NPC: Chef aprendiz 🍕 — fracciones y sumas) y `reino-quest-2` "El mercado de rebajas" (NPC: Mercader de la plaza 🏪 — porcentajes y decimales).

## 6. Referencias de temporada — `src/content/season.js`

La spec base lo exige: nada de cifras con fecha fuera de este archivo, para poder refrescarlo cada pocos meses sin tocar contenido.

```js
export const SEASON = { etiqueta: 'julio 2026', juegos: [...], criaturas: [...], snacks: [...], deportes: [...] }
export function pickSeason(rng, lista)   // elige un elemento; determinista dado rng
```

- Listas de **nombres genéricos y evergreen** (juegos, mascotas, snacks, deportes) que las fábricas insertan en los enunciados.
- Lo usan las fábricas nuevas de los Mundos 1-2. **No se retrofitea** el contenido existente: sería un diff enorme sin ganancia, y los Mundos 3-8 ya usan referencias evergreen en línea.
- Test: listas no vacías, sin cifras con fecha, `pickSeason` determinista.

## 7. Progresión entre mundos y portal de teletransporte

La parte con riesgo: cambia las reglas para partidas ya empezadas.

### 7.1 Estado v3

`defaultState()` gana `portalPasses: []` (ids de mundo superados por portal) y el reducer la acción `PORTAL_PASSED`. `persistence.js` ya lleva v1 → v2 rellenando defaults; se extiende a v3 con la misma estrategia, de modo que un save v2 sin el campo lo recibe vacío.

### 7.2 Regla de desbloqueo (pura, en `content/worldMap.js`)

Un mundo está **abierto** si se cumple cualquiera de estas:

1. Es el primero del recorrido (Mundo 1).
2. El mundo anterior tiene **jefe derrotado** (`bossDefeats`).
3. El mundo anterior fue **superado por portal** (`portalPasses`).
4. **El jugador ya tiene progreso en ese mundo** (`completedLevels` incluye alguno de sus niveles).

La cuarta cláusula es el grandfathering: quien venía jugando los Mundos 3-8 los conserva abiertos sin migración ni casos especiales. Un jugador nuevo sí ve la escalera cerrada.

`nodeState` gana el valor `locked` (distinto de `coming-soon`, que se conserva para futuros teasers aunque ya no lo use ningún nodo).

### 7.3 Portal

Ruta `/mundo/:slug/portal`, accesible desde la tarjeta de un mundo bloqueado.

- **5 preguntas** del mundo bloqueado vía `buildBossPool` (ya existe), **sin vidas**.
- Se aprueba con **4 de 5**. Fallar no castiga: se puede reintentar con preguntas nuevas.
- Aprobar despacha `PORTAL_PASSED` → el mundo queda "superado por portal": **abre el siguiente, no da estrellas ni maestría**. El jugador puede volver a jugar sus niveles a por estrellas cuando quiera.
- La tarjeta del mundo lo refleja ("Superado por portal") para que no parezca completado.

### 7.4 Mapa

Los dos nodos teaser de `worldMap.js` (`isla-numerica`, `reino-fracciones`) pasan de `status: 'coming-soon'` / `target: null` / `mode: 'none'` a nodos jugables con `levelKeys`. Las formas 3D `island` y `pizza` **ya están implementadas** en `three/WorldObject.jsx`.

En consecuencia: `pathOrder` pasa a recorrer los 8 mundos y `teaserBranch` desaparece — `three/Paths.jsx` la consume para dibujar el ramal bloqueado y debe dejar de hacerlo. `WorldMap2D` distingue `locked` (con acceso al portal) de `coming-soon` ("Próximamente").

## 8. Arquitectura

### 8.1 Archivos

**Nuevos:** `content/season.js` · `content/worlds/mundo{1,2}-*.jsx` · `content/quests/mundo{1,2}-quests.jsx` · `engine/PortalTrial.jsx` · 5 widgets (`recta-numerica`, `divisores-explorer`, `jerarquia-pasos`, `pizza-fracciones`, `porcentaje-barra`).

**Modificados:** `content/worlds/index.js` (mundo1 y mundo2 al principio) · `content/quests/index.js` · `content/worldMap.js` (nodos, `pathOrder`, regla de desbloqueo, `nodeState`) · `widgets/index.js` · `state/gameStore.js` (v3 + `PORTAL_PASSED`) · `state/persistence.js` · `engine/WorldView.jsx` (ocultar modo estudio sin página) · `components/WorldMap2D.jsx` · `three/Paths.jsx` · `App.jsx` (ruta del portal).

### 8.2 Rutas nuevas

`/mundo/:slug/portal` — prueba de dominio. Las demás rutas no cambian.

### 8.3 Testing

Convención del proyecto: lógica pura + integración ligera, **sin tests visuales de widgets**.

- `mundo{1,2}.test.js` — estructura y fábricas, espejo de `mundo3.test.js`.
- `mundo{1,2}-quests.test.js` — 300 tiradas: 4 opciones distintas y `correctAnswer` válido.
- `season.test.js` — formas y determinismo.
- `worldMap.test.js` — **actualizar**: hoy afirma `pathOrder` de 6 y el ramal de teasers. Añadir la regla de desbloqueo con su caso de grandfathering.
- `persistence.test.js` — migración v2 → v3.
- `portal-integracion.test.jsx` — aprobar abre el siguiente mundo sin dar estrellas.
- `validateContent.test.js` — pasa con los 8 mundos y sus sidequests.

### 8.4 Capas (orden de dependencias)

**A** `season.js` → **B** Mundo 1 → **C** Mundo 2 → **D** desbloqueo + portal → **E** cierre.

El gating va **al final a propósito**: cambiar las reglas de progresión cuando la escalera ya está completa evita una ventana en la que el mundo inicial todavía no existe y la puerta ya está puesta.

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| El gating deja fuera a quien ya jugaba | Cláusula de progreso previo + test dedicado con un save de Mundos 3-8 |
| Volumen: 8 niveles, 2 jefes, 4 sidequests, 5 widgets escritos a mano | Capas B y C independientes, cada una con su commit verde |
| Tono demasiado teen colándose en Mundos 1-2 | Reglas del §3 + repaso explícito de briefings en el cierre |
| Widgets nuevos sin test visual (convención) | Se verifican en el recorrido e2e en navegador |

## 10. Fuera de alcance (Fase 5)

Export/import de partida, celebración 3D de logro y de jefe, tests en CI, lazy loading por mundo, y retrofit de `season.js` sobre los Mundos 3-8.
