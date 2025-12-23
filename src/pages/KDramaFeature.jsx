import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { kdramaAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const KDramaFeature = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [dramas, setDramas] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchDramas()
    }
  }, [isAuthenticated])

  const fetchDramas = async () => {
    try {
      setLoading(true)
      const response = await kdramaAPI.getAll()
      if (response.success) {
        setDramas(response.data)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter dramas based on active tab
  const filteredDramas = activeTab === 'All' 
    ? dramas 
    : activeTab === 'Watching'
    ? dramas.filter(drama => drama.status === 'Watching')
    : activeTab === 'Completed'
    ? dramas.filter(drama => drama.status === 'Completed')
    : activeTab === 'Plan to Watch'
    ? dramas.filter(drama => drama.status === 'Plan to Watch')
    : activeTab === 'On Hold'
    ? dramas.filter(drama => drama.status === 'On Hold')
    : dramas

  // Calculate stats from real data
  const stats = {
    totalDramas: dramas.length,
    completed: dramas.filter(d => d.status === 'Completed').length,
    watching: dramas.filter(d => d.status === 'Watching').length,
    planToWatch: dramas.filter(d => d.status === 'Plan to Watch').length,
    onHold: dramas.filter(d => d.status === 'On Hold').length,
    totalEpisodes: dramas.reduce((sum, d) => sum + (d.episodes || 0), 0),
    averageRating: dramas.length > 0 
      ? (dramas.reduce((sum, d) => sum + (d.rating || 0), 0) / dramas.length).toFixed(1)
      : 0,
    favoriteGenre: 'Romance' // Can be calculated if you add genre field
  }

  const kpiCards = [
    {
      title: 'Total K-Dramas',
      value: stats.totalDramas,
      icon: '🇰🇷',
      color: 'from-purple-500 to-pink-500',
      subtitle: 'In Collection'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: '✅',
      color: 'from-green-500 to-emerald-500',
      subtitle: 'Finished Series'
    },
    {
      title: 'Watching',
      value: stats.watching,
      icon: '👀',
      color: 'from-blue-500 to-cyan-500',
      subtitle: 'Currently Watching'
    },
    {
      title: 'Total Episodes',
      value: stats.totalEpisodes,
      icon: '📺',
      color: 'from-rose-500 to-pink-500',
      subtitle: 'Episodes Watched'
    },
    {
      title: 'Average Rating',
      value: parseFloat(stats.averageRating).toFixed(1),
      icon: '⭐',
      color: 'from-yellow-500 to-orange-500',
      subtitle: 'Out of 10'
    },
    {
      title: 'Favorite Genre',
      value: stats.favoriteGenre,
      icon: '💕',
      color: 'from-pink-500 to-rose-500',
      subtitle: 'Most Watched'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-400/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient">
            K-Drama Collection
          </h1>
          <motion.button
            onClick={() => navigate('/kdrama')}
            className="glass-strong px-6 py-2 rounded-xl font-semibold text-lg hover:scale-105 transition-transform duration-300"
          >
            View Collection →
          </motion.button>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-4 overflow-x-auto pb-2 justify-center">
          {['All', 'Watching', 'Completed', 'Plan to Watch', 'On Hold'].map((filter, index) => (
            <motion.button
              key={filter}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveTab(filter)}
              className={`px-6 py-2 rounded-full whitespace-nowrap hover:scale-105 transition-all duration-300 ${
                activeTab === filter
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'glass-strong hover:bg-white/20 dark:hover:bg-black/20'
              }`}
            >
              {filter}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          {kpiCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card group hover:scale-105 transition-transform duration-300 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-base shadow-lg`}>
                    {card.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gradient mb-1">
                      {card.value}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {card.subtitle}
                    </div>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {card.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card"
          >
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-3">
              <span>📊</span>
              Status Overview
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Completed', value: stats.completed, total: stats.totalDramas || 1, color: 'bg-green-500' },
                { label: 'Watching', value: stats.watching, total: stats.totalDramas || 1, color: 'bg-blue-500' },
                { label: 'Plan to Watch', value: stats.planToWatch, total: stats.totalDramas || 1, color: 'bg-purple-500' },
                { label: 'On Hold', value: stats.onHold, total: stats.totalDramas || 1, color: 'bg-yellow-500' },
              ].map((item) => {
                const percentage = stats.totalDramas > 0 ? (item.value / item.total) * 100 : 0
                return (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                      <span className="text-slate-600 dark:text-slate-400">{item.value} / {item.total}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className={`h-2 rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card"
          >
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-3">
              <span>🎯</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/kdrama')}
                className="w-full glass-strong px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 text-left flex items-center justify-between"
              >
                <span>Browse Collection</span>
                <span>→</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default KDramaFeature

