import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import UploadButton from '../components/UploadButton'
import { kdramaAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const KDrama = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [dramas, setDramas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDrama, setEditingDrama] = useState(null)
  const [newDrama, setNewDrama] = useState({
    title: '',
    year: 2024,
    rating: 0,
    status: 'Plan to Watch',
    episodes: 0,
    image: '🇰🇷'
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchDramas()
  }, [isAuthenticated, navigate])

  const fetchDramas = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await kdramaAPI.getAll()
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
        setDramas(sortedData)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch K-Drama data')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (data) => {
    try {
      setError('')
      setLoading(true)
      const newDramas = data.map((item) => ({
        title: item.title || item.name || item['Title'] || `K-Drama`,
        year: parseInt(item.year || item['Year'] || 2024),
        rating: parseInt(item.rating || item['Rating'] || item.score || 0),
        status: item.status || item['Status'] || 'Plan to Watch',
        episodes: parseInt(item.episodes || item['Episodes'] || 0),
        image: item.image || item['Image'] || '🇰🇷'
      }))
      
      // Create all dramas via API
      for (const dramaData of newDramas) {
        await kdramaAPI.create(dramaData)
      }
      
      // Refresh the list
      await fetchDramas()
    } catch (err) {
      setError(err.message || 'Failed to upload K-Drama data')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditDrama = (drama) => {
    setEditingDrama(drama)
    setNewDrama({
      title: drama.title || '',
      year: drama.year || 2024,
      rating: drama.rating || 0,
      status: drama.status || 'Plan to Watch',
      episodes: drama.episodes || 0,
      image: drama.image || '🇰🇷'
    })
    setShowEditModal(true)
  }

  const handleUpdateDrama = async (e) => {
    e.preventDefault()
    if (!editingDrama || !newDrama.title) return
    
    try {
      setError('')
      await kdramaAPI.update(editingDrama.id, newDrama)
      
      // Refresh the list
      await fetchDramas()
      
      setShowEditModal(false)
      setEditingDrama(null)
      setNewDrama({
        title: '',
        year: 2024,
        rating: 0,
        status: 'Plan to Watch',
        episodes: 0,
        image: '🇰🇷'
      })
    } catch (err) {
      setError(err.message || 'Failed to update K-Drama')
      console.error('Update error:', err)
    }
  }

  const handleDeleteDrama = async (id) => {
    if (!window.confirm('Are you sure you want to delete this K-Drama?')) return
    
    try {
      setError('')
      await kdramaAPI.delete(id)
      
      // Refresh the list
      await fetchDramas()
    } catch (err) {
      setError(err.message || 'Failed to delete K-Drama')
      console.error('Delete error:', err)
    }
  }

  const statusColors = {
    'Watching': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    'Completed': 'bg-green-500/20 text-green-300 border-green-500/50',
    'Plan to Watch': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    'On Hold': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  }

  if (loading && dramas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading K-Dramas...</div>
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
          <div>
            <h1 className="text-base font-bold mb-4 text-gradient flex items-center gap-4">
              <span className="text-6xl">🇰🇷</span>
              K-Drama Collection
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Track your Korean drama journey
            </p>
          </div>
          <div className="flex gap-3">
            <UploadButton
              onUpload={handleUpload}
              acceptedTypes={['.xlsx', '.xls', '.csv']}
              title="Upload K-Drama Data"
              buttonText="Upload"
              gradient="from-purple-500 to-pink-500"
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add New K-Drama</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dramas.map((drama, index) => (
          <motion.div
            key={drama.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card group hover:scale-105 transition-transform duration-300 relative"
          >
            {/* Edit and Delete Icons */}
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <button
                onClick={() => handleEditDrama(drama)}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteDrama(drama.id)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-110"
                title="Delete"
              >
                🗑️
              </button>
            </div>
            <div className="text-6xl mb-4 text-center">{drama.image}</div>
            <h3 className="text-base font-bold mb-2 text-slate-800 dark:text-slate-200">
              {drama.title}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[drama.status]}`}>
                {drama.status}
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Year:</span>
                <span className="font-semibold">{drama.year}</span>
              </div>
              <div className="flex justify-between">
                <span>Episodes:</span>
                <span className="font-semibold">{drama.episodes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rating:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < drama.rating / 2 ? 'text-yellow-400' : 'text-slate-400'}>
                      ★
                    </span>
                  ))}
                  <span className="ml-2 font-semibold">{drama.rating}/10</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Drama Modal */}
      {showEditModal && editingDrama && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditingDrama(null) }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass-card w-full max-w-2xl p-6 z-10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Edit K-Drama</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Update the details and save.</p>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingDrama(null) }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDrama} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                name="title"
                value={newDrama.title}
                onChange={(e) => setNewDrama({ ...newDrama, title: e.target.value })}
                placeholder="Drama title*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                name="year"
                type="number"
                value={newDrama.year}
                onChange={(e) => setNewDrama({ ...newDrama, year: parseInt(e.target.value) || 2024 })}
                placeholder="Year"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select
                value={newDrama.status}
                onChange={(e) => setNewDrama({ ...newDrama, status: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                value={newDrama.rating}
                onChange={(e) => setNewDrama({ ...newDrama, rating: parseInt(e.target.value) || 0 })}
                placeholder="Rating (0-10)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                name="episodes"
                type="number"
                value={newDrama.episodes}
                onChange={(e) => setNewDrama({ ...newDrama, episodes: parseInt(e.target.value) || 0 })}
                placeholder="Episodes"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                name="image"
                value={newDrama.image}
                onChange={(e) => setNewDrama({ ...newDrama, image: e.target.value || '🇰🇷' })}
                placeholder="Image URL or Emoji"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingDrama(null) }}
                  className="px-4 py-2 rounded-lg bg-white/20 dark:bg-black/20 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 glow-on-hover"
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

export default KDrama

