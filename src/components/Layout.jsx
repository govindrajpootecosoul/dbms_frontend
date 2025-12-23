import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './CircularMenu'
import ThemeToggle from './ThemeToggle'
import { useSidebar } from '../context/SidebarContext'
import { useAuth } from '../context/AuthContext'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Determine if we should show back button (on feature pages)
  const showBackButton = location.pathname.includes('/feature')
  const getBackPath = () => {
    if (location.pathname.includes('/anime/feature')) return '/anime'
    if (location.pathname.includes('/movies/feature')) return '/movies'
    if (location.pathname.includes('/kdrama/feature')) return '/kdrama'
    if (location.pathname.includes('/genshin/feature')) return '/genshin'
    if (location.pathname.includes('/games/feature')) return '/games'
    if (location.pathname.includes('/credentials/feature')) return '/credentials'
    return '/'
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 transition-colors duration-500" />
      
      {/* Floating orbs for depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Back Button - Show on feature pages */}
      {showBackButton && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(getBackPath())}
          className="fixed top-4 left-4 z-50 glass-strong px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Go Back"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back</span>
        </motion.button>
      )}

      {/* Top Right Controls - Theme Toggle Only */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>


      {/* Main Content */}
      <motion.main 
        className="relative z-10 min-h-screen transition-all duration-300"
        animate={{ marginLeft: isCollapsed ? '4rem' : '14rem' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="container mx-auto px-4 py-4 pt-4"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  )
}

export default Layout

