import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import WorldMap from './pages/WorldMap'
import WorldView from './engine/WorldView'
import LevelPlayer from './engine/LevelPlayer'
import StudyView from './engine/StudyView'
import BossArena from './engine/BossArena'
import QuestPlayer from './engine/QuestPlayer'
import Shop from './pages/Shop'
import NotFound from './components/NotFound'
import { blockRoutes } from './content/worldMap'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<WorldMap />} />
        <Route path="/mundo/:slug" element={<WorldView />} />
        <Route path="/mundo/:slug/nivel/:levelId" element={<LevelPlayer />} />
        <Route path="/mundo/:slug/estudio" element={<StudyView />} />
        <Route path="/mundo/:slug/jefe" element={<BossArena />} />
        <Route path="/mundo/:slug/quest/:questId" element={<QuestPlayer />} />
        <Route path="/tienda" element={<Shop />} />
        {blockRoutes.map(b => (
          <Route key={b.path} path={b.path} element={<Navigate to={`/mundo/${b.slug}`} replace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
