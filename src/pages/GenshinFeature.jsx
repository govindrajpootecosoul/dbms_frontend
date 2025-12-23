import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { genshinAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const GenshinFeature = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch characters data from API
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchCharacters = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await genshinAPI.getAll()
        if (response.success) {
          // Map MongoDB _id to id for compatibility
          const mappedData = response.data.map(item => ({
            ...item,
            id: item._id
          }))
          setCharacters(mappedData)
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch characters data')
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCharacters()
  }, [isAuthenticated, navigate])

  // Calculate statistics dynamically from characters
  const calculateStats = () => {
    if (!characters || characters.length === 0) {
      return {
        totalCharacters: 0,
        fiveStar: 0,
        fourStar: 0,
        maxLevel: 0,
        adventureRank: 0,
        totalConstellations: 0,
        favoriteElement: 'N/A'
      }
    }

    const totalCharacters = characters.length
    const fiveStar = characters.filter(c => c.rarity === 5).length
    const fourStar = characters.filter(c => c.rarity === 4).length
    
    // Get max level from all characters
    const maxLevel = Math.max(...characters.map(c => c.characterLevel || 0), 0)
    
    // Get highest adventure rank (assuming it's stored per character or use max)
    const adventureRank = Math.max(...characters.map(c => c.adventureRank || 0), 0)
    
    // Calculate total constellations
    const totalConstellations = characters.reduce((sum, char) => {
      return sum + (parseInt(char.constellation) || 0)
    }, 0)

    // Find most common element
    const elementCounts = {}
    characters.forEach(char => {
      const element = char.element || 'Unknown'
      elementCounts[element] = (elementCounts[element] || 0) + 1
    })
    const favoriteElement = Object.keys(elementCounts).reduce((a, b) => 
      elementCounts[a] > elementCounts[b] ? a : b, 'N/A'
    )

    return {
      totalCharacters,
      fiveStar,
      fourStar,
      maxLevel,
      adventureRank,
      totalConstellations,
      favoriteElement
    }
  }

  const stats = calculateStats()

  const kpiCards = [
    {
      title: 'Total Characters',
      value: stats.totalCharacters,
      icon: '👥',
      color: 'from-amber-500 to-orange-500',
      subtitle: 'In Collection'
    },
    {
      title: '5★ Characters',
      value: stats.fiveStar,
      icon: '⭐',
      color: 'from-yellow-500 to-amber-500',
      subtitle: 'Premium Units'
    },
    {
      title: '4★ Characters',
      value: stats.fourStar,
      icon: '✨',
      color: 'from-purple-500 to-pink-500',
      subtitle: 'Standard Units'
    },
    {
      title: 'Adventure Rank',
      value: `AR ${stats.adventureRank}`,
      icon: '🎯',
      color: 'from-blue-500 to-cyan-500',
      subtitle: 'Current Level'
    },
    {
      title: 'Max Level',
      value: `Lv.${stats.maxLevel}`,
      icon: '⬆️',
      color: 'from-green-500 to-emerald-500',
      subtitle: 'Highest Level'
    },
    {
      title: 'Constellations',
      value: stats.totalConstellations,
      icon: '🌟',
      color: 'from-indigo-500 to-blue-500',
      subtitle: 'Total Unlocked'
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient">
            GENSHIN IMPACT
          </h1>
          <p className="text-4xl md:text-5xl text-slate-600 dark:text-slate-300 mb-4">
            Build, Track, and Master Your Characters
          </p>
          <motion.button
            onClick={() => navigate('/genshin')}
            className="glass-strong px-6 py-2 rounded-xl font-semibold text-lg hover:scale-105 transition-transform duration-300"
          >
            View Characters →
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
              <span>📊</span>
              Character Rarity
            </h3>
            <div className="space-y-4">
              {[
                { label: '5★ Characters', value: stats.fiveStar, total: stats.totalCharacters, color: 'bg-yellow-500' },
                { label: '4★ Characters', value: stats.fourStar, total: stats.totalCharacters, color: 'bg-purple-500' },
              ].map((item) => {
                const percentage = stats.totalCharacters > 0 ? (item.value / stats.totalCharacters) * 100 : 0
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
                onClick={() => navigate('/genshin')}
                className="w-full glass-strong px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 text-left flex items-center justify-between"
              >
                <span>Browse Characters</span>
                <span>→</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default GenshinFeature

