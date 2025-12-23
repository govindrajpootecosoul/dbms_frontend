import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { animeAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const AnimeFeature = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [animeList, setAnimeList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch anime data from API
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchAnime = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await animeAPI.getAll()
        if (response.success) {
          // Map MongoDB _id to id for compatibility
          const mappedData = response.data.map(item => ({
            ...item,
            id: item._id
          }))
          setAnimeList(mappedData)
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch anime data')
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnime()
  }, [isAuthenticated, navigate])

  // Calculate statistics dynamically from animeList
  const calculateStats = () => {
    if (!animeList || animeList.length === 0) {
      return {
        totalAnime: 0,
        completed: 0,
        watching: 0,
        onHold: 0,
        dropped: 0,
        watchLater: 0,
        yetToAir: 0,
        totalEpisodes: 0,
        averageRating: 0,
        totalHours: 0
      }
    }

    const totalAnime = animeList.length
    const completed = animeList.filter(a => a.watchStatus === 'Completed').length
    const watching = animeList.filter(a => a.watchStatus === 'Watching').length
    const onHold = animeList.filter(a => a.watchStatus === 'On Hold').length
    const dropped = animeList.filter(a => a.watchStatus === 'Dropped').length
    const watchLater = animeList.filter(a => a.watchStatus === 'Watch Later').length
    const yetToAir = animeList.filter(a => a.watchStatus === 'Yet to Air').length
    
    // Calculate total episodes watched (sum of episodeOn)
    const totalEpisodes = animeList.reduce((sum, anime) => {
      const episodes = parseInt(anime.episodeOn || 0)
      return sum + episodes
    }, 0)

    // Calculate average rating if available (assuming rating field exists)
    const ratings = animeList
      .map(a => parseFloat(a.rating || a.averageRating || 0))
      .filter(r => r > 0)
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0

    // Estimate watch time: assume ~20 minutes per episode
    const totalHours = Math.round((totalEpisodes * 20) / 60)

    return {
      totalAnime,
      completed,
      watching,
      onHold,
      dropped,
      watchLater,
      yetToAir,
      totalEpisodes,
      averageRating,
      totalHours
    }
  }

  const stats = calculateStats()

  const kpiCards = [
    {
      title: 'Total Anime',
      value: stats.totalAnime,
      icon: '🎌',
      color: 'from-pink-500 to-rose-500',
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
      color: 'from-purple-500 to-pink-500',
      subtitle: 'Episodes Watched'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A',
      icon: '⭐',
      color: 'from-yellow-500 to-orange-500',
      subtitle: stats.averageRating > 0 ? 'Out of 10' : 'No ratings yet'
    },
    {
      title: 'Watch Time',
      value: `${stats.totalHours}h`,
      icon: '⏱️',
      color: 'from-indigo-500 to-blue-500',
      subtitle: 'Total Hours'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading statistics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-pink-400/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient">
            IMMERSE IN ANIME
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-4">
            Track Your Journey Through Anime Worlds
          </p>
          <motion.button
            onClick={() => navigate('/anime')}
            className="glass-strong px-6 py-2 rounded-xl font-semibold text-sm hover:scale-105 transition-transform duration-300"
          >
            View All Anime →
          </motion.button>
        </motion.div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          {kpiCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card group hover:scale-105 transition-transform duration-300 relative overflow-hidden"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-lg shadow-lg`}>
                    {card.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gradient mb-1">
                      {card.value}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {card.subtitle}
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {card.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card"
          >
            <h3 className="text-lg font-bold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>📊</span>
              Status Breakdown
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Completed', value: stats.completed, total: stats.totalAnime, color: 'bg-green-500' },
                { label: 'Watching', value: stats.watching, total: stats.totalAnime, color: 'bg-blue-500' },
                { label: 'On Hold', value: stats.onHold, total: stats.totalAnime, color: 'bg-yellow-500' },
                { label: 'Dropped', value: stats.dropped, total: stats.totalAnime, color: 'bg-red-500' },
              ].map((item) => {
                const percentage = stats.totalAnime > 0 ? (item.value / stats.totalAnime) * 100 : 0
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
            <h3 className="text-lg font-bold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>🎯</span>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/anime')}
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

export default AnimeFeature

