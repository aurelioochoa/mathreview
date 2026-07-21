# Fase 1 — Follow-ups de endurecimiento (diseño)

Fecha: 2026-07-21 · Rama: `feat/rediseno-worldmap-3d`

Cierra los follow-ups no bloqueantes de la revisión final de Fase 1
(ver `TODO.md`), consolidando el refactor de `gameStore` hecho durante la
limpieza del rediseño.

## Alcance

Cuatro ítems pequeños y relacionados:

1. **Infra de test de componentes + render-test de `GameProvider`/`useGame`.**
2. **`key={levelId}` en `LevelPlayer`** (evita estado obsoleto en nav nivel→nivel).
3. **`try/catch` en `persistSave`** (`QuotaExceededError` / modo privado).
4. **Corrección de referencia obsoleta en `TODO.md`**.

Fuera de alcance: migración de contenido (Fase 2), gamificación (Fase 3).

## 1. Infra de test + render-test

- Añadir devDeps `@testing-library/react` + `jsdom`.
- `vite.config.js`: `test: { environment: 'jsdom', globals: true }`.
  Los 50 tests de lógica existentes siguen pasando bajo jsdom; `globals`
  habilita el auto-cleanup de RTL.
- `src/state/__tests__/GameProvider.test.jsx` (con `renderHook` + `act`,
  `localStorage.clear()` en `beforeEach`):
  - `useGame()` sin proveedor → lanza el error personalizado.
  - dentro de `<GameProvider>` → devuelve `{ state, dispatch }`, `state`
    igual a `initialState`.
  - `dispatch(LEVEL_COMPLETED …)` dentro de `act` → `state` se actualiza.
- Versiones/config exactas se verifican contra la documentación vigente
  (RTL 16 + React 19 tiene peers específicos).

## 2. `key={levelId}` en `LevelPlayer`

- Renombrar el componente actual a `LevelPlayerView` (interno) y exportar
  por defecto un envoltorio delgado que lee `levelId` de `useParams()` y
  renderiza `<LevelPlayerView key={levelId} />`.
- Fuerza un remount limpio (resetea `phase`/`attempt`/`lives`/…) si/cuando
  exista navegación nivel→nivel. Hoy no existe (el fin de nivel solo enlaza
  de vuelta al mundo), así que es preventivo e inocuo.
- El import en `App.jsx` no cambia (sigue siendo el default export). Ambos
  son componentes → sin impacto en lint.

## 3. `try/catch` en `persistSave`

- Envolver las dos llamadas a `setItem` en `try/catch` que absorbe
  `QuotaExceededError` / fallos de modo privado con un comentario. Sin
  `console.warn` (el efecto corre en cada cambio de estado → haría spam).
  El juego sigue desde el estado en memoria.
- **Bonus:** `src/state/__tests__/persistence.test.js` — round-trip
  guardar/cargar, backup al sobrescribir, y caso de cuota (`setItem` lanza →
  `persistSave` no lanza). No existe test de persistencia hoy.

## 4. `TODO.md`

- Actualizar la referencia obsoleta a `state/gameStore.jsx` (ahora
  `gameStore.js` + `GameProvider.jsx`) y marcar el follow-up del render-test.

## Verificación

`npm run lint` (0 problemas) · `npm test` (50 previos + nuevos) · `npm run build`.
