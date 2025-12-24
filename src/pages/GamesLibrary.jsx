import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import UploadButton from '../components/UploadButton'
import { gameAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const GamesLibrary = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  const [newGame, setNewGame] = useState({
    title: '',
    platform: 'PC',
    status: 'Plan to Play',
    rating: 0,
    image: '🎮'
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchGames()
  }, [isAuthenticated, navigate])

  const fetchGames = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await gameAPI.getAll()
      if (response.success) {
        const mappedData = response.data.map(item => ({
          ...item,
          id: item._id
        }))
        // Sort alphabetically by title
        const sortedData = mappedData.sort((a, b) => {
          const titleA = (a.title || '').toLowerCase()
          const titleB = (b.title || '').toLowerCase()
          return titleA.localeCompare(titleB)
        })
        setGames(sortedData)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch games data')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (data) => {
    try {
      setError('')
      setLoading(true)
      const newGames = data.map((item) => ({
        title: item.title || item.name || item['Title'] || `Game`,
        platform: item.platform || item['Platform'] || 'PC',
        status: item.status || item['Status'] || 'Plan to Play',
        rating: parseInt(item.rating || item['Rating'] || item.score || 0),
        image: item.image || item['Image'] || '🎮'
      }))
      
      // Create all games via API
      for (const gameData of newGames) {
        await gameAPI.create(gameData)
      }
      
      // Refresh the list
      await fetchGames()
    } catch (err) {
      setError(err.message || 'Failed to upload games data')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGame = async (e) => {
    e.preventDefault()
    if (!newGame.title) return
    
    try {
      setError('')
      await gameAPI.create(newGame)
      
      // Refresh the list
      await fetchGames()
      
      setShowAddModal(false)
      setNewGame({
        title: '',
        platform: 'PC',
        status: 'Plan to Play',
        rating: 0,
        image: '🎮'
      })
    } catch (err) {
      setError(err.message || 'Failed to add game')
      console.error('Add game error:', err)
    }
  }

  const handleEditGame = (game) => {
    setEditingGame(game)
    setNewGame({
      title: game.title || '',
      platform: game.platform || 'PC',
      status: game.status || 'Plan to Play',
      rating: game.rating || 0,
      image: game.image || '🎮'
    })
    setShowEditModal(true)
  }

  const handleUpdateGame = async (e) => {
    e.preventDefault()
    if (!editingGame || !newGame.title) return
    
    try {
      setError('')
      await gameAPI.update(editingGame.id, newGame)
      
      // Refresh the list
      await fetchGames()
      
      setShowEditModal(false)
      setEditingGame(null)
      setNewGame({
        title: '',
        platform: 'PC',
        status: 'Plan to Play',
        rating: 0,
        image: '🎮'
      })
    } catch (err) {
      setError(err.message || 'Failed to update game')
      console.error('Update error:', err)
    }
  }

  const handleDeleteGame = async (id) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return
    
    try {
      setError('')
      await gameAPI.delete(id)
      
      // Refresh the list
      await fetchGames()
    } catch (err) {
      setError(err.message || 'Failed to delete game')
      console.error('Delete error:', err)
    }
  }

  const statusColors = {
    'Playing': 'bg-green-500/20 text-green-300 border-green-500/50',
    'Completed': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    'On Hold': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    'Plan to Play': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  }

  const platformColors = {
    'PC': 'from-blue-500 to-cyan-500',
    'PlayStation 5': 'from-blue-600 to-indigo-600',
    'Nintendo Switch': 'from-red-500 to-pink-500',
    'Xbox': 'from-green-500 to-emerald-500',
  }

  // Filter games based on active filter
  const filteredGames = activeFilter === 'All' 
    ? games 
    : games.filter(game => game.status === activeFilter)

  if (loading && games.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading games...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 relative"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <motion.button
              onClick={() => navigate('/')}
              className="mb-4 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-300"
            >
              <span className="text-2xl">←</span>
              <span className="font-semibold">Back</span>
            </motion.button>
            <h1 className="text-base font-bold mb-4 text-gradient flex items-center gap-4">
              <span className="text-6xl">🎮</span>
              Games Library
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Your gaming collection and progress
            </p>
          </div>
          <div className="flex gap-3">
            <UploadButton
              onUpload={handleUpload}
              acceptedTypes={['.xlsx', '.xls', '.csv']}
              title="Upload Games Data"
              buttonText="Upload"
              gradient="from-green-500 to-emerald-500"
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add New Game</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
        {['All', 'Playing', 'Completed', 'On Hold', 'Plan to Play'].map((filter, index) => (
          <motion.button
            key={filter}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-full whitespace-nowrap hover:scale-105 transition-transform duration-300 font-semibold ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'glass-strong'
            }`}
          >
            {filter}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredGames.length > 0 ? (
          filteredGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card group hover:scale-105 transition-transform duration-300 relative"
          >
            {/* Edit and Delete Icons */}
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <button
                onClick={() => handleEditGame(game)}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteGame(game.id)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-110"
                title="Delete"
              >
                🗑️
              </button>
            </div>
            <div className={`w-full h-32 rounded-xl bg-gradient-to-br ${platformColors[game.platform] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-6xl mb-4`}>
              {game.image}
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200 line-clamp-2">
              {game.title}
            </h3>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[game.status]}`}>
                {game.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium glass-strong">
                {game.platform}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Rating:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < game.rating / 2 ? 'text-yellow-400' : 'text-slate-400'}>
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm font-semibold">{game.rating}/10</span>
              </div>
            </div>
          </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full glass-card text-center py-12"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">
              No games found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {activeFilter === 'All' 
                ? 'No games in your collection yet.' 
                : `No games with status "${activeFilter}" yet.`}
            </p>
          </motion.div>
        )}
      </div>

      {/* Add Game Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass-card w-full max-w-2xl p-6 z-10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Add Game</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Fill the details and save.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGame} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                name="title"
                value={newGame.title}
                onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                placeholder="Game title*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <select
                value={newGame.platform}
                onChange={(e) => setNewGame({ ...newGame, platform: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {Object.keys(platformColors).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={newGame.status}
                onChange={(e) => setNewGame({ ...newGame, status: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {Object.keys(statusColors).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                name="rating"
                type="number"
                min="0"
                max="10"
                value={newGame.rating}
                onChange={(e) => setNewGame({ ...newGame, rating: parseInt(e.target.value) || 0 })}
                placeholder="Rating (0-10)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                name="image"
                value={newGame.image}
                onChange={(e) => setNewGame({ ...newGame, image: e.target.value || '🎮' })}
                placeholder="Image URL or Emoji"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400 md:col-span-2"
              />
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/20 dark:bg-black/20 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 glow-on-hover"
                >
                  Add
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Game Modal */}
      {showEditModal && editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditingGame(null) }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass-card w-full max-w-2xl p-6 z-10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Edit Game</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Update the details and save.</p>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingGame(null) }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateGame} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                name="title"
                value={newGame.title}
                onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                placeholder="Game title*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <select
                value={newGame.platform}
                onChange={(e) => setNewGame({ ...newGame, platform: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {Object.keys(platformColors).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={newGame.status}
                onChange={(e) => setNewGame({ ...newGame, status: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {Object.keys(statusColors).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                name="rating"
                type="number"
                min="0"
                max="10"
                value={newGame.rating}
                onChange={(e) => setNewGame({ ...newGame, rating: parseInt(e.target.value) || 0 })}
                placeholder="Rating (0-10)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                name="image"
                value={newGame.image}
                onChange={(e) => setNewGame({ ...newGame, image: e.target.value || '🎮' })}
                placeholder="Image URL or Emoji"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-400 md:col-span-2"
              />
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingGame(null) }}
                  className="px-4 py-2 rounded-lg bg-white/20 dark:bg-black/20 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 glow-on-hover"
                >
                  Update
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default GamesLibrary

