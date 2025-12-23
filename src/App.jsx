import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { SidebarProvider } from './context/SidebarContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
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
import Websites from './pages/Websites'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/*" element={
              <ProtectedRoute>
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
                    <Route path="/websites" element={<Websites />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
          </Router>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App

