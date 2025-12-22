import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { SidebarProvider } from './context/SidebarContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import AnimeTracker from './pages/AnimeTracker'
import AnimeFeature from './pages/AnimeFeature'
import MoviesSeries from './pages/MoviesSeries'
import MoviesFeature from './pages/MoviesFeature'
import KDrama from './pages/KDrama'
import KDramaFeature from './pages/KDramaFeature'
import GenshinImpact from './pages/GenshinImpact'
import GenshinFeature from './pages/GenshinFeature'
import GamesLibrary from './pages/GamesLibrary'
import GamesFeature from './pages/GamesFeature'
import CredentialManager from './pages/CredentialManager'
import CredentialsFeature from './pages/CredentialsFeature'

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/anime" element={<AnimeTracker />} />
              <Route path="/anime/feature" element={<AnimeFeature />} />
              <Route path="/movies" element={<MoviesSeries />} />
              <Route path="/movies/feature" element={<MoviesFeature />} />
              <Route path="/kdrama" element={<KDrama />} />
              <Route path="/kdrama/feature" element={<KDramaFeature />} />
              <Route path="/genshin" element={<GenshinImpact />} />
              <Route path="/genshin/feature" element={<GenshinFeature />} />
              <Route path="/games" element={<GamesLibrary />} />
              <Route path="/games/feature" element={<GamesFeature />} />
              <Route path="/credentials" element={<CredentialManager />} />
              <Route path="/credentials/feature" element={<CredentialsFeature />} />
            </Routes>
          </Layout>
        </Router>
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App

