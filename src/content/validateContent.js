// Validador puro de contenido de mundos. Devuelve una lista de problemas (vacía = OK).
// Ejecuta cada fábrica una vez para comprobar la forma de las preguntas generadas.
// `questsByWorld` es opcional: si no se pasa, no se valida nada de sidequests
// (así el validador sigue sirviendo para comprobar mundos sueltos).
export function validateContent({ worlds, widgets, worldMapNodes, questsByWorld }) {
  const problems = []
  const slugs = new Set()
  const idsPorMundo = {}

  for (const w of worlds) {
    if (!w.id) problems.push(`mundo sin id: ${w.slug ?? '¿?'}`)
    if (!w.slug) problems.push(`mundo ${w.id} sin slug`)
    if (slugs.has(w.slug)) problems.push(`slug duplicado: ${w.slug}`)
    slugs.add(w.slug)
    if (!w.boss || typeof w.boss.name !== 'string' || typeof w.boss.emoji !== 'string')
      problems.push(`mundo ${w.id}: falta boss bien formado { name, emoji, intro }`)
    if (questsByWorld) {
      const quests = questsByWorld[w.id] ?? []
      if (quests.length === 0) problems.push(`mundo ${w.id}: sin sidequests (≥1 requerida)`)
      for (const quest of quests) {
        const etiqueta = `${w.id}/${quest.id ?? '¿?'}`
        if (!Array.isArray(quest.questions) || quest.questions.length < 3 || quest.questions.length > 5)
          problems.push(`${etiqueta}: la quest necesita 3-5 fábricas`)
        for (const [i, f] of (quest.questions ?? []).entries()) {
          let q
          try { q = f() } catch (e) { problems.push(`${etiqueta}: fábrica ${i} lanzó: ${e.message}`); continue }
          if (!Array.isArray(q?.options) || q.options.length !== 4 || new Set(q.options).size !== 4)
            problems.push(`${etiqueta}: fábrica ${i} no tiene 4 opciones distintas`)
          if (!(q?.correctAnswer >= 0 && q?.correctAnswer < 4))
            problems.push(`${etiqueta}: fábrica ${i} correctAnswer inválido`)
        }
      }
    }
    if (!Array.isArray(w.levels) || w.levels.length === 0) {
      problems.push(`mundo ${w.id} sin niveles`)
      continue
    }
    const levelIds = new Set()
    idsPorMundo[w.id] = levelIds
    for (const lvl of w.levels) {
      if (!lvl.id) problems.push(`${w.id}: nivel sin id`)
      if (levelIds.has(lvl.id)) problems.push(`${w.id}: id de nivel duplicado "${lvl.id}"`)
      levelIds.add(lvl.id)
      if (!Array.isArray(lvl.briefing) || lvl.briefing.length === 0)
        problems.push(`${w.id}/${lvl.id}: briefing vacío`)
      for (const step of lvl.briefing ?? []) {
        if (step.type === 'widget' && !widgets[step.widgetId])
          problems.push(`${w.id}/${lvl.id}: widget desconocido "${step.widgetId}"`)
      }
      if (!lvl.reto || !Array.isArray(lvl.reto.factories) || lvl.reto.factories.length < 3)
        problems.push(`${w.id}/${lvl.id}: reto necesita ≥3 fábricas`)
      for (const [i, f] of (lvl.reto?.factories ?? []).entries()) {
        let q
        try { q = f() } catch (e) { problems.push(`${w.id}/${lvl.id}: fábrica ${i} lanzó: ${e.message}`); continue }
        if (!q || typeof q.question !== 'string')
          problems.push(`${w.id}/${lvl.id}: fábrica ${i} sin question`)
        if (!Array.isArray(q?.options) || q.options.length !== 4)
          problems.push(`${w.id}/${lvl.id}: fábrica ${i} no tiene 4 opciones`)
        else if (new Set(q.options).size !== 4)
          problems.push(`${w.id}/${lvl.id}: fábrica ${i} tiene opciones repetidas`)
        if (!(q?.correctAnswer >= 0 && q?.correctAnswer < 4))
          problems.push(`${w.id}/${lvl.id}: fábrica ${i} correctAnswer inválido`)
      }
    }
  }

  // Cruce con el mapa: todo levelKey de un nodo 'game' debe existir en un mundo real.
  for (const node of worldMapNodes) {
    if (node.mode === 'game') {
      if (!Array.isArray(node.levelKeys) || node.levelKeys.length === 0) {
        problems.push(`nodo ${node.id} es 'game' pero no tiene levelKeys`)
        continue
      }
      for (const key of node.levelKeys) {
        const [mundoId, levelId] = key.split('/')
        if (!idsPorMundo[mundoId]?.has(levelId))
          problems.push(`nodo ${node.id}: levelKey "${key}" no corresponde a ningún nivel real`)
      }
    }
  }
  return problems
}
