# Investigación — gamificación educativa y cultura pop (julio 2026)

*Búsquedas web realizadas el 2026-07-18 para fundamentar el diseño de Math Quest.*

## 1. Gamificación educativa: qué funciona

- **La gamificación bien diseñada produce mejoras reales de aprendizaje**: un meta-análisis reporta un efecto grande (g≈0.82) en resultados educativos. ([PMC meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC10591086/))
- La tendencia 2025+ es abandonar el "pointsification" (puntos por todo) hacia **narrativa + niveles adaptativos + feedback en tiempo real**, que es lo que muestra mayores efectos. ([eLearning Industry](https://elearningindustry.com/gamification-in-learning-enhancing-engagement-and-retention-in-2025), [IJRISS systematic review](https://rsisinternational.org/journals/ijriss/articles/gamification-tools-for-enhancing-academic-performance-a-systematic-review-of-classroom-applications/))
- La combinación **mecánicas + dinámicas + estética** tiene el mayor tamaño de efecto; la experiencia debe sostenerse en el tiempo para producir ganancias. ([PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10591086/))
- **Riesgos documentados**: pérdida de motivación intrínseca si todo es premio extrínseco, y problemas de equidad; los leaderboards pueden desmotivar a los de bajo rendimiento. ([Springer TKL](https://link.springer.com/article/10.1007/s10758-025-09823-z), [Frontiers in Education](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1684459/full))
- Las vidas/corazones punitivos estilo Duolingo generan frustración cuando bloquean el aprendizaje (crítica recurrente en la literatura y la prensa de producto).

**Decisiones derivadas:** vidas suaves que nunca bloquean seguir jugando; sin leaderboards; XP/insignias al servicio de una narrativa de mundos; feedback inmediato por pregunta (ya existe en MiniQuiz); rejugabilidad con variantes generadas (práctica real, no memorización).

## 2. Quests como disfraz de la práctica

- **Prodigy Math**: RPG donde responder preguntas de mates alimenta los ataques en batallas; mundos, quests, mascotas y recompensas envuelven la práctica. ([Prodigy](https://www.prodigygame.com/main-en/blog/what-is-prodigy-math-game))
- **Classcraft**: los quests son mapas de aprendizaje autoguiado donde cada pin es una tarea; los questlines encadenan misiones que construyen sobre lo anterior. ([Classcraft blog](https://www.classcraft.com/blog/features/tool-personalized-learning-quests/), [Edutopia](https://www.edutopia.org/article/using-quests-project-based-learning/))
- Los quests permiten gamificar **evitando** las trampas extrínsecas de puntos/leaderboards: el motor es la narrativa y la elección. ([Edutopia](https://www.edutopia.org/article/using-quests-project-based-learning/))

**Decisiones derivadas:** sidequests opcionales con narrativa (ayudar a un personaje con un problema real de números), sin vidas (espacio seguro), con recompensa de XP/monedas; jefes de mundo como "examen disfrazado".

## 3. Cultura pop infantil/adolescente (estado julio 2026)

- **Evergreen confirmado**: Roblox (~380M usuarios activos), Fortnite (~650M registrados, 60M+ diarios), Minecraft (~204M jugadores mensuales) siguen dominando; "si un niño no juega Fortnite o Roblox queda fuera de la conversación". Consolas 73% y móvil 70% entre teens. ([Icon Era stats](https://icon-era.com/statistics/teenagers-playing-video-games-statistics-and-trends-for-2026/), [ScreenWise guide](https://screenwiseapp.com/guides/popular-video-games-by-age))
- En Latinoamérica, **Free Fire** sigue siendo relevante en móvil (ya está usado en el contenido actual de la app); la escena indie latam crece pero no mueve a los niños. ([Video games in Latin America](https://en.wikipedia.org/wiki/Video_games_in_Latin_America))
- **Blind boxes / recompensas sorpresa**: 52% de padres compraron blind box toys el último año — el gancho de "cofre sorpresa" está culturalmente vigente. ([Toy Association trends](https://www.toyassociation.org/ta/toys/research-and-data/reports/trend-spotting.aspx))
- **Cultura de creadores**: los niños crecen viendo builders/creators en YouTube/TikTok; los formatos de rutinas y coleccionismo dominan entre tweens. ([Toy Association](https://www.toyassociation.org/ta/toys/research-and-data/reports/trend-spotting.aspx), [momgenerations](https://momgenerations.com/2026/05/what-tweens-are-obsessed-with-right-now-summer-2026-edition/))

**Decisiones derivadas:** dos capas de tematización — **evergreen** en las plantillas de preguntas (Minecraft/Roblox/Fortnite/fútbol/pizza/creators genéricos) y **temporada** (`season.js`) para lo viral del momento, refrescable sin tocar el juego. Cofres sorpresa como recompensa de nivel.

## 4. Progresión multi-nivel

- Modelo de referencia: mastery-based (estilo Khan Academy) — el jugador puede demostrar dominio y saltar; los mundos se organizan como escalera de habilidades de aritmética → álgebra/geometría/datos de 10mo.
- **Decisión derivada:** desbloqueo secuencial de mundos + "portal de teletransporte" (prueba corta de dominio) para que jugadores mayores salten mundos básicos.
