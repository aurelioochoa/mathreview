# Spec de diseño — Rediseño visual: World Map 3D + sistema glossy

*Fecha: 2026-07-19. Estado: aprobado por Aurelio en sesión de brainstorming.*

Continúa el spec base [`2026-07-18-math-quest-design.md`](2026-07-18-math-quest-design.md). Este documento cubre **solo la capa visual/experiencia** (Spec 1). La migración de contenido de los bloques al motor de retos (Fase 2) y jefes/sidequests (Fase 3) quedan como follow-ons con sus propios specs.

## 1. Objetivo

Rediseñar Math Quest para que se vea y se sienta como **un solo juego 3D moderno**: una portada que es un **mapa de mundos 3D** navegable, un sistema visual "aventura glossy" unificado, y animaciones/transiciones a lo largo de toda la app. **Sin reescribir el contenido pedagógico ya probado**: se conservan las rutas, el motor (`LevelPlayer`, `WorldView`, generadores) y la lógica de estado (`gameStore`, `xpCurve`, persistencia).

## 2. Decisiones de alcance (acordadas)

| Decisión | Elección |
|---|---|
| Alcance | **Rehacer la experiencia** = sistema visual + World Map 3D + HUD + reskin de bloques y modo juego. Enfoque **A** (hub 3D + reskin glossy). |
| Profundidad | **Reskin + capa 3D/animación.** Se conserva contenido, rutas y lógica. La migración de contenido (Fase 2) es follow-on. |
| Tecnología 3D | **react-three-fiber (three.js) como protagonista** en el mapa y celebraciones; acentos 3D ligeros en el resto. |
| Dirección visual | **Aventura glossy**: mundos/islas 3D flotantes, objetos redondeados con brillo, colores vivos, UI "chunky". |
| Tema | **Claro y vibrante** (cielo/aventura). Modo oscuro: fuera de alcance (posible follow-on). |
| Assets 3D | **Geometría procedural + drei**, sin descargar modelos ni HDR externos. **100% offline/self-contained** (deploy por Cloudflare Tunnel). |
| Tipografía | Fuente display redondeada **auto-hospedada** (sin CDN) para títulos; Nunito/system para cuerpo. |

**Fuera de alcance:** migración de contenido de bloques al motor de retos, jefes, sidequests, logros, tienda, modo oscuro, modelos 3D externos/GLB, backend.

## 3. Identidad de mundos (alineada con el spec base)

El mapa presenta los **6 bloques existentes** con su identidad de mundo del roadmap. Cada nodo enruta al contenido actual (página de bloque o modo juego), sin cambiar dicho contenido.

| Nodo | Mundo | Ruta destino hoy | Estado |
|---|---|---|---|
| 🌋 | Volcán de las Potencias | `/mundo/volcan-potencias` (modo juego) | Jugable |
| 🏰 | Castillo del Álgebra | `/bloque2` | Estudio |
| 🌀 | Laberinto de Sistemas | `/bloque3` | Estudio |
| 🚀 | Estación de Funciones | `/bloque4` | Estudio |
| ⛰️ | Montañas de Geometría | `/bloque5` | Estudio |
| 🎡 | Feria de Datos | `/bloque6` | Estudio |

> Nota: el Bloque 1 ya está migrado como Mundo 3 (`volcan-potencias`); su ruta `/bloque1` sigue viva pero el nodo del mapa apunta al modo juego. Opcional (nice-to-have): mostrar 🏝️ Isla Numérica y 🍕 Reino de las Fracciones como islas "Próximamente" bloqueadas para insinuar crecimiento.

## 4. Arquitectura

### 4.1 Rutas (sin cambios de lógica)

```
/                       → WorldMap (nueva home; reemplaza Home.jsx)
/bloque1..6             → páginas de bloque reskineadas (mismo contenido)
/mundo/:slug            → WorldView reskineado
/mundo/:slug/nivel/:id  → LevelPlayer reskineado + celebración 3D
```

### 4.2 Fuente de verdad unificada

Nuevo `src/content/worldMap.js`: array de nodos con `{ id, world, emoji, title, subtitle, theme (color), shape (tipo de objeto 3D), position [x,y,z], target (ruta), mode: 'game' | 'study', unlockRule }`. **Elimina la duplicación** del array `bloques` hoy repetido en `Home.jsx` y `Layout.jsx`; ambos (y el mapa) consumen esta fuente.

### 4.3 Archivos nuevos / tocados

```
src/
  content/worldMap.js          nodos del mapa (fuente única)
  pages/WorldMap.jsx           nueva home: monta canvas 3D o fallback 2D
  three/
    WorldMapCanvas.jsx         escena react-three-fiber (lazy)
    WorldObject.jsx            mundo glossy: mesh temático + isla + label + estado
    Celebration.jsx            estallido de nivel completado (lazy)
    lighting.jsx               luz de 3 puntos + gradiente procedural (sin CDN)
    useDeviceTier.js           detección WebGL/rendimiento → nivel de calidad
    FloatingAccent.jsx         acento 3D decorativo ligero para cabeceras
  components/
    Hud.jsx                    HUD de juego (montado en Layout)
    WorldMap2D.jsx             mapa 2D accesible / fallback CSS
    PageTransition.jsx         AnimatePresence alrededor del <Outlet>
  index.css                    tokens glossy en @theme + @font-face de la fuente
public/fonts/                  woff2 de la fuente display (auto-hospedada)
```

Tocados: `Layout.jsx` (HUD + transiciones), `App.jsx` (home → WorldMap), `Home.jsx` (retirado o su "consejo" reubicado), `WorldView.jsx`, `LevelPlayer.jsx`, páginas `Bloque1..6` (tokens glossy; sin cambios de contenido).

## 5. Sistema visual glossy (tokens)

- **`@theme` de Tailwind 4:** fondo cielo/degradado vibrante; 6 colores de mundo (los actuales, más saturados/ricos); tokens de vidrio (`--glass-bg`, blur), elevación/sombra suave, glow por color, radios `rounded-3xl`/`rounded-[2rem]`.
- **Tipografía:** display redondeada auto-hospedada (p. ej. Fredoka/Baloo 2 variable, `woff2` en `public/fonts/`, vía `@font-face`) para títulos y HUD; Nunito o system para cuerpo. Sin Google Fonts CDN.
- **Componentes base reutilizables:** superficie "panel de vidrio", botón glossy (estados hover/press), chip/badge, barra de progreso animada. Usados en bloques, HUD y modo juego para lograr coherencia de "un solo juego".

## 6. World Map 3D

- `<Canvas>` full-bleed con **6 mundos/islas** glossy, cada uno con forma temática (cristal de números, arco de parábola, islitas de barras, etc.) sobre plataforma redondeada, dispuestos en **arco tipo mapa de niveles** con un caminito que los conecta.
- **Animación:** bobbing (`<Float>` de drei), auto-rotación lenta, deriva suave de cámara. Hover → el mundo escala + brilla + muestra su nombre (label). Click → dolly de cámara hacia el mundo y transición a su ruta.
- **Materiales glossy:** MeshStandardMaterial pulido (metalness alta / roughness baja) o transmisión tipo gelatina; **bloom ligero** (`@react-three/postprocessing`, import dinámico) para el glow.
- **Progreso:** nodos bloqueados/desbloqueados según `state.completedLevels` (las páginas de estudio siempre desbloqueadas; regla en `worldMap.js`).
- **Iluminación:** manual (ambient + directional + 1-2 point) + gradiente de fondo procedural. **Prohibidos los presets `<Environment>` de drei** (descargan HDR de CDN externo → rompe offline/CSP).

## 7. HUD de juego + shell persistente

- La barra superior actual se convierte en **HUD** (montado en `Layout`, persistente en todas las rutas): logo/home a la izquierda; a la derecha **Nivel + título** (`titleForLevel`), **barra de XP animada**, **monedas** con "pop" al cambiar, y **vidas** en contexto de nivel. Lee `useGame()` + `xpCurve`.
- **Móvil:** el HUD se condensa (iconos + números, sin etiquetas largas). La navegación entre mundos vive en el mapa, no en una barra de "Bloque 1..6".

## 8. Reskin de bloques, nivel y celebraciones

- **Bloques y modo juego:** adoptan los tokens glossy (cards `rounded-3xl`, cabeceras con degradado, paneles de vidrio, botones consistentes). **Tilt sutil** en tarjetas y **transiciones de página** (fade/slide con `AnimatePresence` alrededor del `<Outlet>`). Contenido sin cambios.
- **LevelPlayer:** se mantiene la máquina de estados (`briefing → reto → fallado → completado`). En `completado`, **celebración 3D** (`Celebration.jsx`, lazy): confeti/estallido + objeto del mundo girando + estrellas que saltan. Reduced-motion → estático.
- **Acentos 3D** decorativos ligeros en cabeceras de bloque vía `FloatingAccent`.

## 9. Rendimiento y accesibilidad

- **Carga diferida:** `WorldMapCanvas` y `Celebration` con `React.lazy` + `Suspense`; three.js no se carga en páginas de estudio hasta necesitarse. `postprocessing` con import dinámico.
- **`prefers-reduced-motion`:** sin auto-rotación/float/bloom/transiciones; poses estáticas.
- **Nivel de equipo (`useDeviceTier`):** cap de `dpr` (`[1, 1.5]`), `PerformanceMonitor` (drei) para degradar calidad, pausar el canvas si la pestaña/está fuera de viewport.
- **Fallback 2D (`WorldMap2D`):** si no hay WebGL o el equipo es de gama baja, mapa 2D en CSS (tarjetas glossy con parallax). **Nunca una página rota.**
- **A11y:** cada mundo 3D está respaldado por un **enlace DOM real y enfocable** (lista accesible o el mapa 2D); teclado y lectores de pantalla llegan a todos los mundos. **La navegación no depende del WebGL.** Contraste AA en texto sobre superficies glossy.

## 10. Dependencias

Añadir (versiones exactas a fijar en el plan, verificando compatibilidad con React 19):
- `three`
- `@react-three/fiber` **v9** (compatible con React 19)
- `@react-three/drei`
- `@react-three/postprocessing` (import dinámico; solo para bloom)
- `motion` (animaciones/transiciones DOM: HUD, tilt, transiciones de página)

## 11. Estrategia de tests

- Los **28 tests de lógica** existentes se conservan intactos (deben seguir pasando).
- **Nuevos:**
  - `worldMap.js`: cada nodo apunta a una ruta válida; la regla de desbloqueo se comporta según `completedLevels`.
  - `WorldMap2D`: renderiza los 6 mundos con sus enlaces correctos (smoke test del fallback accesible).
  - `Hud`: refleja XP/nivel/monedas del estado.
- **No** se testea la escena WebGL (frágil): se testea el dato + fallback + accesibilidad.
- **e2e manual** en navegador (mapa carga, hover/click navega, fallback 2D, reduced-motion, celebración) — cubre el pendiente de verificación e2e del TODO.

## 12. Criterios de aceptación

1. La home es un mapa de mundos 3D glossy con los 6 mundos, animados, navegables por click y por teclado.
2. HUD persistente muestra nivel/XP/monedas reales y anima sus cambios.
3. Bloques y modo juego comparten el sistema visual glossy y tienen transiciones de página.
4. LevelPlayer muestra una celebración 3D al completar un nivel.
5. Con `prefers-reduced-motion` o sin WebGL, la app funciona con fallback 2D estático y navegación completa.
6. Sin dependencias de CDN externas en runtime (offline-safe). `npm run build` OK y `npm test` verde.
7. El contenido, las rutas y la lógica de juego actuales siguen intactos.

## 13. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| three.js pesa/carga lento en equipos escolares | lazy + code-split, cap `dpr`, `PerformanceMonitor`, fallback 2D |
| drei baja assets de CDN (Environment/HDR) | iluminación manual; prohibido usar presets remotos |
| React 19 + R3F compatibilidad | fijar R3F v9 y verificar en el plan antes de codear |
| KaTeX/fórmulas dentro de WebGL | el 3D es decorativo/navegación; el texto/matemáticas siguen en DOM |
| Regresión del contenido probado | no se toca el contenido; tests de lógica intactos como red de seguridad |
