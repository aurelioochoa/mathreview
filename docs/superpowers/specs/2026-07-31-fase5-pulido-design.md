# Spec de diseño — Fase 5: Pulido (celebraciones, traspaso de partida y CI)

> Fase anterior: [Fase 4 — Contenido nuevo](2026-07-31-fase4-contenido-nuevo-design.md) (cerrada, escalera 8-15 años completa).
> Spec base: [Math Quest](2026-07-18-math-quest-design.md).

## 1. Objetivo

Cerrar tres cabos que el juego arrastra desde que es jugable de punta a punta:

1. **Las victorias grandes se celebran igual que las pequeñas.** Derrotar a un jefe lanza exactamente la misma animación que superar un nivel cualquiera, y desbloquear un logro no lanza ninguna: solo un aviso de texto.
2. **La partida está presa del navegador.** Vive en el `localStorage` de un dispositivo. Cambiar de tablet, o vaciar la caché, es empezar de cero.
3. **Nada verifica el repo salvo la disciplina de quien commitea.** Hay 249 tests y no los ejecuta ninguna máquina.

Al cerrar la fase, cada tipo de victoria se siente distinta, una partida se mueve entre dispositivos por tres vías, y ningún cambio entra en `main` sin pasar lint, tests y build.

## 2. Decisiones acordadas (brainstorming)

| Tema | Decisión |
|---|---|
| Alcance | Tres de los cuatro puntos del TODO. **El lazy loading se aplaza** |
| Celebraciones | **Variantes de la que ya existe**: un componente, tres caras (`nivel` / `jefe` / `logro`) |
| Celebración de logro | **Dentro del toast**, con el confeti de fondo. Nunca a pantalla completa |
| Traspaso de partida | **Tres vías**: código de texto, fichero y QR |
| Lectura del QR | **Escáner dentro del juego**, con cámara |
| Compresión del código | **Sí**, `CompressionStream` nativa. Sin ella el código no cabe en un QR (§4.1) |
| CI | Lint + tests + build. La validación de contenido **no lleva paso propio**: ya viaja en la suite |

### 2.1. Por qué se aplaza el lazy loading

El punto del TODO decía «lazy loading por mundo», pero al medirlo el peso no estaba en los mundos:

| chunk | crudo | notas |
|---|---|---|
| `index.js` | **1 321 KB** (385 KB gzip) | app + `mafs` + `recharts` + `katex` + `motion` + contenido |
| `react-three-fiber` | 860 KB | ya está fuera del arranque, tras `WorldMapCanvas` |

El bocado gordo es que `App.jsx` importa `StudyView` de forma directa, y `StudyView` importa **los seis `Bloque*.jsx` de golpe** (~2 100 líneas), que a su vez arrastran `mafs` y `recharts`. Todo jugador paga el modo estudio completo aunque no lo abra jamás. El registro de `widgets` que importa `LevelPlayer` hace lo propio con los 24 widgets.

Se aplaza por decisión de producto: el trabajo se hará cuando entren más funciones 3D y el bundle inicial importe de verdad. **Estas cifras quedan aquí como línea base** para medir entonces. Lo que esta fase sí respeta es no empeorarlo: todo lo que se añade y pesa (QR) entra por `lazy()`.

## 3. Celebraciones con variante

`src/three/Celebration.jsx` no acepta props hoy: dibuja un trofeo dorado y 40 piezas de confeti multicolor. Pasa a aceptar `variant`, gobernada por una tabla pura y exportable:

```js
export const CELEBRATION_VARIANTS = {
  nivel: { pieces: 40, centerpiece: 'trofeo',  scale: 1,    camera: 5,   colors: [...] },
  jefe:  { pieces: 64, centerpiece: 'corona',  scale: 1.15, camera: 5,   colors: [...] },
  logro: { pieces: 18, centerpiece: 'medalla', scale: 0.55, camera: 3.2, colors: [...] },
}
```

- `variant` por defecto es `'nivel'`, y **esa variante reproduce exactamente lo de hoy**: paleta multicolor, trofeo, 40 piezas. Regresión visual cero en el nivel superado.
- `jefe` es la fiesta gorda: corona (toro + conos), paleta cálida, más confeti, escala mayor.
- `logro` es la fiesta pequeña: medalla (cilindro plano + toro de borde), paleta dorada, poco confeti y cámara cerca, porque vive dentro de una caja de ~320×90 px.
- Que la tabla sea un objeto puro permite testearla sin WebGL, que en jsdom no existe.

**Consumidores:**

| Sitio | Variante | Estado hoy |
|---|---|---|
| `LevelPlayer.jsx:184` | `nivel` | ya llama a `Celebration`; solo pasa la prop |
| `BossArena.jsx:157` | `jefe` | ya llama a `Celebration`; hoy es indistinguible del nivel |
| `Toast.jsx` | `logro` | **nuevo** |

El `Toast` crece un poco, se vuelve `relative overflow-hidden` y mete el canvas en una capa de fondo bajo el texto, con la misma verja `useDeviceTier` que usan los otros dos. **Cuando no hay 3D, el toast queda idéntico al actual.** Sigue autodescartándose a los 3,5 s y sigue sin bloquear, así que puede convivir con la celebración de nivel sin encolarse: son dos capas distintas de la pantalla, no dos modales peleándose.

## 4. Traspaso de partida

### 4.1. El códec (`src/state/saveCode.js`)

Módulo puro, sin React ni DOM. Formato:

```
MQ1.<base64url( gzip( JSON({ c: <checksum>, s: <partida> }) ) )>
```

- **Checksum FNV-1a de 32 bits** en hexadecimal, calculado sobre `JSON.stringify(partida)`. Seis líneas, sin dependencias. Detecta el código truncado al copiar, que es el fallo real que se quiere cazar; no es una firma criptográfica ni pretende serlo.
- **Prefijo de versión** `MQ1`, para poder cambiar el formato más adelante sin que un código viejo se interprete como basura.
- `encodeSave(state): Promise<string>` y `decodeSave(code): Promise<{ok:true, save} | {ok:false, reason}>`. Son asíncronas porque `CompressionStream` lo es.
- `decodeSave` distingue tres motivos, cada uno con su mensaje al jugador:

  | `reason` | Cuándo | Mensaje |
  |---|---|---|
  | `formato` | prefijo ausente o base64 ilegible | «Esto no parece un código de Math Quest» |
  | `corrupto` | el checksum no cuadra | «El código está incompleto. ¿Se copió entero?» |
  | `incompatible` | `migrate` devuelve `null` | «Este código es de una versión que ya no se reconoce» |

- Antes de dar la partida por buena, `decodeSave` **la pasa por el `migrate` que ya vive en `persistence.js`**. Hoy eso no cambia nada, porque el formato nace ahora y todo código lleva un guardado v3 dentro. Sirve para el caso que llegará: un código exportado hoy y pegado dentro de un año, cuando el estado vaya por v4 o v5. Un código de partida es un guardado que viaja en el tiempo, y debe entrar por el mismo tubo de migración que el de `localStorage`, no por uno paralelo. Eso obliga a exportar `migrate`, hoy privado del módulo.

**Por qué comprimir.** Medido con una partida deliberadamente pesada (40 niveles a 3⭐ con claves largas, 8 jefes, 17 quests, 18 logros, 7 cosméticos):

| formato | tamaño | ¿cabe en un QR? |
|---|---|---|
| JSON | 3 265 B | — |
| base64 a pelo | 4 356 B | **no** (tope byte-mode: 2 953 B) |
| gzip + base64 | **800 B** | sí, de sobra |

Sin compresión el QR es imposible y el código de texto es un ladrillo de cuatro mil caracteres.

**Restricción verificada.** `CompressionStream`/`DecompressionStream` hacen round-trip dentro del jsdom de vitest, pero **`Blob.stream()` no**: el `Blob` de jsdom no produce un stream compatible. El códec debe construir el `ReadableStream` desde el `Uint8Array` directamente. Comprobado con una prueba desechable antes de escribir este spec.

### 4.2. Estado

Acción nueva en `gameStore.js`:

```js
case 'IMPORT_SAVE':
  return action.save   // ya migrada y validada por decodeSave
```

Sustituye el estado entero. El reducer no valida: esa responsabilidad es del códec, y mezclarlas dejaría dos sitios donde equivocarse.

### 4.3. Confirmación antes de importar

Importar es destructivo, así que **no se aplica a ciegas**. El flujo es: decodificar → mostrar un resumen de lo que entra → confirmar.

> Vas a cargar: **Nivel 12** · 3 200 monedas · 18 logros · 22 niveles superados
> Esto reemplaza tu partida actual (Nivel 4 · 310 monedas).
> [ Cargar esta partida ]  [ Cancelar ]

El resumen sirve para dos cosas: evita el borrado accidental y deja al jugador comprobar que pegó el código correcto y no uno viejo.

Red de seguridad gratis: `persistSave` ya copia el guardado actual a `BACKUP_KEY` antes de escribir, así que un import equivocado no evapora lo anterior de forma irrecuperable.

### 4.4. UI — sección «Partida» en `/perfil`

Componente nuevo `src/components/SaveTransfer.jsx`, montado en `Profile.jsx`. Tres vías sobre el mismo códec:

- **Código.** Un `textarea` de solo lectura con el código y botón «Copiar» (`navigator.clipboard`, con selección manual de reserva). Otro `textarea` para pegar el de otro dispositivo.
- **Fichero.** «Descargar partida» genera un `Blob` y dispara un `<a download>`; la vuelta es un `input[type=file]` que lee texto. Extensión `.mathquest`, contenido = el mismo código, así que un fichero también se puede abrir y copiar a mano.
- **QR.** «Mostrar QR» y «Escanear QR».

### 4.5. El QR

Ambas mitades van en chunks `lazy()`, siguiendo el patrón que `Celebration` ya usa. Sin eso, el decodificador engordaría el bundle inicial justo en la fase en que se ha decidido no tocarlo.

- **Generar** — `src/components/QrPanel.jsx`, con `qrcode` (1.5.4, MIT). Si un código superase la capacidad del QR, el panel lo dice y remite a las otras dos vías, en vez de pintar un código ilegible. El peor caso medido son 800 B sobre un tope de 2 953, así que es una guarda, no un camino habitual: se cubre con test, no con UI elaborada.
- **Escanear** — `src/components/QrScanner.jsx`. Usa **`BarcodeDetector` nativo cuando existe** y **jsQR (1.4.0, Apache-2.0) de reserva**, porque Safari en iOS no trae la API nativa.

  Se eligió jsQR sobre `@zxing/browser` por una razón concreta: la vía nativa ya obliga a montar `getUserMedia` y un `<video>` a mano, así que jsQR comparte toda esa fontanería y solo cambia el paso de detección (`jsQR(imageData, w, h)` sobre un canvas). `@zxing/browser` se adueña del ciclo de vida de la cámara, lo que forzaría dos implementaciones paralelas del escáner, y pesa bastante más.

  Fallos de cámara — permiso denegado, sin cámara, origen inseguro — se distinguen y cada uno remite a las otras dos vías. El túnel de Cloudflare sirve por HTTPS y `localhost` es contexto seguro, así que el origen inseguro solo aparece si alguien sirve el `dist` por HTTP plano en la LAN.

## 5. CI

`.github/workflows/ci.yml` — no existe `.github/` en el repo. En push a `main` y en cada pull request:

```
npm ci  →  npm run lint  →  npm test  →  npm run build
```

Sobre **Node 20**, para que coincida con el `Dockerfile` (`node:20-slim`): la CI debe verificar lo que de verdad se despliega, no una versión distinta que casualmente también pasa. Con `actions/setup-node` y caché de npm.

La validación de contenido no lleva paso propio porque `validateContent.test.js` ya la ejecuta dentro de la suite, sobre los ocho mundos y sus sidequests. Un paso aparte sería la misma comprobación corriendo dos veces.

## 6. Tests

| Área | Qué se comprueba |
|---|---|
| Códec | round-trip `encode`→`decode` conserva la partida |
| Códec | un carácter cambiado dispara `corrupto` |
| Códec | basura y cadena vacía disparan `formato` |
| Códec | un código con un guardado v1 o v2 dentro se importa y sale migrado a v3 (§4.1) |
| Códec | el peor caso realista cabe bajo el tope del QR |
| Estado | `IMPORT_SAVE` sustituye el estado entero |
| Celebración | la tabla de variantes tiene las tres claves y la forma esperada |
| Toast | sin 3D renderiza nombre y emoji del logro, como hoy |
| `SaveTransfer` | pegar un código válido muestra el resumen y **no** aplica nada hasta confirmar |

## 7. Fuera de alcance

- **Lazy loading** (§2.1), aplazado a cuando entren más funciones 3D.
- **Sincronización en la nube.** El traspaso es manual y a propósito: no hay servidor, ni cuentas, ni datos de un menor saliendo del dispositivo.
- **Firmar el código de partida.** El checksum detecta corrupción, no manipulación. Un jugador que edite su propio guardado para darse monedas se está haciendo trampas al solitario; no es un modelo de amenaza.
- **Fusionar partidas al importar.** Reemplaza, no mezcla. Fusionar plantea preguntas sin respuesta buena (¿qué racha gana? ¿se suman las monedas?) para un caso de uso que nadie ha pedido.

## 8. Riesgos

- **La API exacta de `qrcode` y `jsQR` se confirma al implementar.** Las versiones y licencias de §4.5 salen de `npm view`; el uso concreto se verifica contra la librería, no contra la memoria.
- **`qrcode` trae build de navegador aparte** (`qrcode/lib/browser`). Si el bundle de Vite se atraganta con el paquete principal, se importa esa ruta.
- **El toast con canvas monta y desmonta un contexto WebGL por logro.** Con la verja de `useDeviceTier` y el autodescarte a 3,5 s no debería acumular contextos, pero conviene mirarlo si caen varios logros seguidos.
