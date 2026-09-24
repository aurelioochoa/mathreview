import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import WorldMap from './pages/WorldMap'
import WorldView from './engine/WorldView'
import LevelPlayer from './engine/LevelPlayer'
import StudyView from './engine/StudyView'
import BossArena from './engine/BossArena'
import QuestPlayer from './engine/QuestPlayer'
import PortalTrial from './engine/PortalTrial'
import Shop from './pages/Shop'
import Achievements from './pages/Achievements'
import Profile from './pages/Profile'
import NotFound from './components/NotFound'
import { blockRoutes } from './content/worldMap'

// La exploración a pie arrastra three.js: en su propio chunk.
const WorldExplore = lazy(() => import('./pages/WorldExplore'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<WorldMap />} />
        <Route path="/mundo/:slug" element={<WorldView />} />
        <Route path="/mundo/:slug/nivel/:levelId" element={<LevelPlayer />} />
        <Route path="/mundo/:slug/explorar" element={<Suspense fallback={null}><WorldExplore /></Suspense>} />
        <Route path="/mundo/:slug/estudio" element={<StudyView />} />
        <Route path="/mundo/:slug/jefe" element={<BossArena />} />
        <Route path="/mundo/:slug/quest/:questId" element={<QuestPlayer />} />
        <Route path="/mundo/:slug/portal" element={<PortalTrial />} />
        <Route path="/tienda" element={<Shop />} />
        <Route path="/logros" element={<Achievements />} />
        <Route path="/perfil" element={<Profile />} />
        {blockRoutes.map(b => (
          <Route key={b.path} path={b.path} element={<Navigate to={`/mundo/${b.slug}`} replace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
