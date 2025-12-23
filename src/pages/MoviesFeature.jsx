import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { movieAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const MoviesFeature = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchContent()
    }
  }, [isAuthenticated])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await movieAPI.getAll()
      if (response.success) {
        setContent(response.data)
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats from real data
  const stats = {
    totalContent: content.length,
    movies: content.filter(item => item.type === 'Movie').length,
    series: content.filter(item => item.type === 'Series').length,
    kDrama: content.filter(item => item.type === 'K Drama').length,
    watched: content.filter(item => item.status === 'Watched' || item.status === 'Completed').length,
    watching: content.filter(item => item.status === 'Watching').length,
    planToWatch: content.filter(item => item.status === 'Plan to Watch').length,
    totalHours: 0, // Can be calculated if you have duration data
    averageRating: content.length > 0 
      ? (content.reduce((sum, item) => sum + (parseFloat(item.rating) || 0), 0) / content.length).toFixed(1)
      : 0
  }

  const kpiCards = [
    {
      title: 'Total Content',
      value: stats.totalContent,
      icon: '🎬',
      color: 'from-blue-500 to-cyan-500',
      subtitle: 'Movies & Series'
    },
    {
      title: 'Movies',
      value: stats.movies,
      icon: '🎞️',
      color: 'from-indigo-500 to-blue-500',
      subtitle: 'In Collection'
    },
    {
      title: 'Series',
      value: stats.series,
      icon: '📺',
      color: 'from-purple-500 to-pink-500',
      subtitle: 'TV Shows'
    },
    {
      title: 'Watched',
      value: stats.watched,
      icon: '✅',
      color: 'from-green-500 to-emerald-500',
      subtitle: 'Completed'
    },
    {
      title: 'Watch Time',
      value: `${stats.totalHours}h`,
      icon: '⏱️',
      color: 'from-orange-500 to-red-500',
      subtitle: 'Total Hours'
    },
    {
      title: 'Avg Rating',
      value: parseFloat(stats.averageRating).toFixed(1),
      icon: '⭐',
      color: 'from-yellow-500 to-amber-500',
      subtitle: 'Out of 10'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading statistics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient">
            YOUR CINEMA COLLECTION
          </h1>
          <p className="text-4xl md:text-5xl text-slate-600 dark:text-slate-300 mb-4">
            Explore, Watch, and Enjoy
          </p>
          <motion.button
            onClick={() => navigate('/movies')}
            className="glass-strong px-6 py-2 rounded-xl font-semibold text-lg hover:scale-105 transition-transform duration-300"
          >
            View Collection →
          </motion.button>
        </motion.div>

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
              <span>📈</span>
              Content Distribution
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Movies', value: stats.movies, total: stats.totalContent, color: 'bg-blue-500' },
                { label: 'Series', value: stats.series, total: stats.totalContent, color: 'bg-purple-500' },
                { label: 'Watching', value: stats.watching, total: stats.totalContent, color: 'bg-cyan-500' },
                { label: 'Plan to Watch', value: stats.planToWatch, total: stats.totalContent, color: 'bg-yellow-500' },
              ].map((item) => {
                const percentage = stats.totalContent > 0 ? (item.value / item.total) * 100 : 0
                return (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                      <span className="text-slate-600 dark:text-slate-400">{item.value}</span>
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
                onClick={() => navigate('/movies')}
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

export default MoviesFeature

