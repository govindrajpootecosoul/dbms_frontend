import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useSidebar } from '../context/SidebarContext'

const menuItems = [
  { path: '/', icon: '🏠', label: 'Home', color: 'from-slate-500 to-gray-500' },
  { path: '/anime/feature', icon: '🎌', label: 'Anime', color: 'from-pink-500 to-rose-500' },
  { path: '/movies/feature', icon: '🎬', label: 'Movies', color: 'from-blue-500 to-cyan-500' },
  { path: '/kdrama/feature', icon: '🇰🇷', label: 'K-Drama', color: 'from-purple-500 to-pink-500' },
  { path: '/genshin/feature', icon: '⚔️', label: 'Genshin', color: 'from-amber-500 to-orange-500' },
  { path: '/games/feature', icon: '🎮', label: 'Games', color: 'from-green-500 to-emerald-500' },
  { path: '/credentials/feature', icon: '🔐', label: 'Credentials', color: 'from-indigo-500 to-blue-500' },
]

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const { isCollapsed, toggleSidebar } = useSidebar()

  const handleItemClick = (path) => {
    navigate(path)
  }

  return (
    <motion.aside
      animate={{ width: isCollapsed ? '4rem' : '14rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col"
    >
      {/* Sidebar Container */}
      <div className="glass-strong h-full w-full backdrop-blur-2xl border-r border-white/20 dark:border-white/10 flex flex-col py-3">
        {/* Collapse Toggle Button */}
        <motion.button
          onClick={toggleSidebar}
          className="glass-strong rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 hover:scale-110 transition-transform duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle sidebar"
        >
          <motion.svg
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-4 h-4 text-slate-700 dark:text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </motion.svg>
        </motion.button>

        {/* Menu Items */}
        <nav className="flex-1 flex flex-col gap-1 px-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative"
              >
                <motion.button
                  onClick={() => handleItemClick(item.path)}
                  className={`
                    w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-2 px-2 py-2 rounded-lg
                    relative group cursor-pointer overflow-hidden
                    transition-all duration-300 text-sm
                    ${isActive 
                      ? 'glass-strong ring-1 ring-white/30' 
                      : 'hover:glass-strong'
                    }
                  `}
                  whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 2 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    boxShadow: hoveredIndex === index && !isActive
                      ? '0 0 15px rgba(59, 130, 246, 0.3)'
                      : '0 0 0px rgba(59, 130, 246, 0)',
                  }}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${item.color} rounded-r-full`}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Gradient background on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`text-lg relative z-10 flex-shrink-0 ${isActive ? 'scale-105' : ''}`}
                    animate={{ scale: isActive ? 1.05 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.icon}
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    animate={{ 
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : 'auto',
                      marginLeft: isCollapsed ? 0 : 'auto'
                    }}
                    className="relative z-10 font-medium text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                </motion.button>
              </motion.div>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-2 pt-2 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-strong rounded-lg p-2 text-center"
          >
            <motion.div
              animate={{ 
                opacity: isCollapsed ? 0 : 1,
                height: isCollapsed ? 0 : 'auto'
              }}
              className="overflow-hidden"
            >
              <div className="text-lg mb-1">✨</div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                Personal Portal
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar

