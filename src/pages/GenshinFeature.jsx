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

  const [editingCard, setEditingCard] = useState(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [customCards, setCustomCards] = useState([])

  // Calculate statistics dynamically from characters
  const calculateStats = () => {
    if (!characters || characters.length === 0) {
      return {
        totalCharacters: 0,
        fiveStar: 0,
        fourStar: 0,
        elementCounts: {
          'Cyro': 0,
          'Electro': 0,
          'Pyro': 0,
          'Hydro': 0,
          'Dendro': 0,
          'Geo': 0,
          'Anemo': 0
        }
      }
    }

    const totalCharacters = characters.length
    const fiveStar = characters.filter(c => c.rarity === 5).length
    const fourStar = characters.filter(c => c.rarity === 4).length
    
    // Calculate element counts
    const elementCounts = {
      'Cyro': 0,
      'Electro': 0,
      'Pyro': 0,
      'Hydro': 0,
      'Dendro': 0,
      'Geo': 0,
      'Anemo': 0
    }
    
    characters.forEach(char => {
      let element = char.element || 'Unknown'
      // Normalize element name (handle case variations and typos)
      const elementMap = {
        'cryo': 'Cyro',
        'cyro': 'Cyro',
        'electro': 'Electro',
        'pyro': 'Pyro',
        'hydro': 'Hydro',
        'dendro': 'Dendro',
        'geo': 'Geo',
        'anemo': 'Anemo'
      }
      const normalizedElement = elementMap[element.toLowerCase()] || element
      
      if (elementCounts.hasOwnProperty(normalizedElement)) {
        elementCounts[normalizedElement] = (elementCounts[normalizedElement] || 0) + 1
      } else {
        // Log unexpected elements for debugging
        console.log('Unexpected element found:', element, 'from character:', char.name || char)
      }
    })

    return {
      totalCharacters,
      fiveStar,
      fourStar,
      elementCounts
    }
  }

  const stats = calculateStats()

  const elementColors = {
    'Cyro': 'from-cyan-500 to-blue-500',
    'Electro': 'from-purple-500 to-pink-500',
    'Pyro': 'from-red-500 to-orange-500',
    'Hydro': 'from-blue-500 to-cyan-500',
    'Dendro': 'from-green-600 to-lime-500',
    'Geo': 'from-amber-500 to-yellow-500',
    'Anemo': 'from-green-500 to-emerald-500'
  }

  const elementIcons = {
    'Cyro': '❄️',
    'Electro': '⚡',
    'Pyro': '🔥',
    'Hydro': '💧',
    'Dendro': '🌿',
    'Geo': '🪨',
    'Anemo': '💨'
  }

  // Element images mapping - images are in public/elements/ folder
  // Actual filenames: "Cryo 1.png", "Electro 1.png", etc. (with space and " 1" suffix)
  const elementImages = {
    'Cyro': '/elements/Cryo 1.png',  // File is "Cryo 1.png" (note: 'r' in filename, 'y' in element name)
    'Electro': '/elements/Electro 1.png',
    'Pyro': '/elements/Pyro 1.png',
    'Hydro': '/elements/Hydro 1.png',
    'Dendro': '/elements/Dendro 1.png',
    'Geo': '/elements/Geo 1.png',
    'Anemo': '/elements/Anemo 1.png'
  }

  // Always show these element cards (even if count is 0)
  const elementCardElements = ['Cyro', 'Electro', 'Pyro', 'Hydro', 'Dendro', 'Geo']
  
  const kpiCards = [
    {
      id: 'totalCharacters',
      title: 'Total Characters',
      value: stats.totalCharacters,
      icon: '👥',
      color: 'from-amber-500 to-orange-500',
      subtitle: 'In Collection',
      editable: false
    },
    {
      id: 'fiveStar',
      title: '5★ Characters',
      value: stats.fiveStar,
      icon: '⭐',
      color: 'from-yellow-500 to-amber-500',
      subtitle: 'Premium Units',
      editable: false
    },
    {
      id: 'fourStar',
      title: '4★ Characters',
      value: stats.fourStar,
      icon: '✨',
      color: 'from-purple-500 to-pink-500',
      subtitle: 'Standard Units',
      editable: false
    },
    // Always show element cards for these elements (even if count is 0)
    ...elementCardElements.map(element => ({
      id: `element-${element}`,
      title: element,
      value: stats.elementCounts[element] || 0,
      icon: elementIcons[element] || '⚔️',
      image: elementImages[element],
      color: elementColors[element] || 'from-gray-500 to-gray-600',
      subtitle: 'Characters',
      editable: false,
      type: 'element'
    })),
    ...customCards
  ]

  // Debug: Log stats to see what we have
  useEffect(() => {
    console.log('=== GenshinFeature Debug ===')
    console.log('Stats:', stats)
    console.log('Characters count:', characters.length)
    console.log('Characters:', characters)
    console.log('Element counts:', stats.elementCounts)
    console.log('KPI Cards count:', kpiCards.length)
    console.log('Element cards:', kpiCards.filter(c => c.type === 'element'))
    console.log('All KPI Cards:', kpiCards.map(c => ({ id: c.id, title: c.title, type: c.type })))
    console.log('==========================')
  }, [characters, stats])

  const handleEditCard = (card) => {
    setEditingCard(card)
  }

  const handleUpdateCard = (cardId, newValue) => {
    if (cardId.startsWith('custom-')) {
      setCustomCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, value: newValue } : card
      ))
    }
    setEditingCard(null)
  }

  const handleAddCard = (newCard) => {
    const cardId = `custom-${Date.now()}`
    setCustomCards(prev => [...prev, {
      id: cardId,
      title: newCard.title,
      value: newCard.value,
      icon: newCard.icon || '📊',
      color: newCard.color || 'from-gray-500 to-gray-600',
      subtitle: newCard.subtitle || '',
      editable: true,
      type: newCard.type || 'text'
    }])
    setShowAddCard(false)
  }

  const handleDeleteCard = (cardId) => {
    setCustomCards(prev => prev.filter(card => card.id !== cardId))
  }

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
          className="mb-4"
        >
          <motion.button
            onClick={() => navigate('/')}
            className="mb-4 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-300"
          >
            <span className="text-2xl">←</span>
            <span className="font-semibold">Back</span>
          </motion.button>
          <div className="text-center">
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
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          {kpiCards.map((card, index) => (
            <motion.div
              key={card.id || card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card group hover:scale-105 transition-transform duration-300 relative overflow-hidden"
            >
              {card.editable && (
                <div className="absolute top-2 right-2 flex gap-2 z-20">
                  <button
                    onClick={() => handleEditCard(card)}
                    className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  {card.id?.startsWith('custom-') && (
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-110"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative z-10">
                {editingCard?.id === card.id ? (
                  <div className="space-y-3">
                    <input
                      type={card.type === 'number' ? 'number' : 'text'}
                      min={card.min}
                      max={card.max}
                      defaultValue={card.value}
                      onBlur={(e) => {
                        if (e.target.value !== '') {
                          handleUpdateCard(card.id, e.target.value)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (e.target.value !== '') {
                            handleUpdateCard(card.id, e.target.value)
                          }
                        } else if (e.key === 'Escape') {
                          setEditingCard(null)
                        }
                      }}
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg font-bold"
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Press Enter to save, Esc to cancel
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-base shadow-lg overflow-hidden relative`}>
                        {card.type === 'element' && card.image ? (
                          <>
                            <span className="text-2xl absolute inset-0 flex items-center justify-center z-0 emoji-icon">
                              {card.icon}
                            </span>
                            <img 
                              src={card.image} 
                              alt={card.title}
                              className="w-full h-full object-contain p-2 relative z-10"
                              onError={(e) => {
                                console.error('Failed to load image:', card.image)
                                e.target.style.display = 'none'
                                const emoji = e.target.parentElement.querySelector('.emoji-icon')
                                if (emoji) emoji.style.zIndex = '10'
                              }}
                              onLoad={(e) => {
                                const emoji = e.target.parentElement.querySelector('.emoji-icon')
                                if (emoji) emoji.style.display = 'none'
                              }}
                            />
                          </>
                        ) : (
                          <span className="text-2xl">
                            {card.icon}
                          </span>
                        )}
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
                  </>
                )}
              </div>
            </motion.div>
          ))}
          
          {/* Add New Card Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: kpiCards.length * 0.1, duration: 0.5 }}
            className="glass-card group hover:scale-105 transition-transform duration-300 relative overflow-hidden cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600"
            onClick={() => setShowAddCard(true)}
          >
            <div className="flex flex-col items-center justify-center h-full min-h-[140px] text-slate-400 dark:text-slate-500">
              <div className="text-4xl mb-2">+</div>
              <div className="text-sm font-semibold">Add New Card</div>
            </div>
          </motion.div>
        </div>

        {/* Add Card Modal */}
        {showAddCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddCard(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative glass-card w-full max-w-md p-6 z-10"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Add New Card</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Create a custom stat card</p>
                </div>
                <button
                  onClick={() => setShowAddCard(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                handleAddCard({
                  title: formData.get('title'),
                  value: formData.get('value'),
                  icon: formData.get('icon') || '📊',
                  color: formData.get('color') || 'from-gray-500 to-gray-600',
                  subtitle: formData.get('subtitle') || '',
                  type: formData.get('type') || 'text'
                })
              }} className="space-y-3">
                <input
                  required
                  name="title"
                  placeholder="Card Title*"
                  className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <input
                  required
                  name="value"
                  placeholder="Value*"
                  className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <input
                  name="subtitle"
                  placeholder="Subtitle"
                  className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <input
                  name="icon"
                  placeholder="Icon (emoji)"
                  className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <select
                  name="color"
                  className="w-full px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="from-amber-500 to-orange-500">Amber to Orange</option>
                  <option value="from-blue-500 to-cyan-500">Blue to Cyan</option>
                  <option value="from-green-500 to-emerald-500">Green to Emerald</option>
                  <option value="from-purple-500 to-pink-500">Purple to Pink</option>
                  <option value="from-red-500 to-orange-500">Red to Orange</option>
                  <option value="from-indigo-500 to-blue-500">Indigo to Blue</option>
                  <option value="from-gray-500 to-gray-600">Gray</option>
                </select>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCard(false)}
                    className="px-4 py-2 rounded-lg bg-white/20 dark:bg-black/20 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
                  >
                    Add Card
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

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

