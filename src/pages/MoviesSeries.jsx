import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import UploadButton from '../components/UploadButton'
import { movieAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const MoviesSeries = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'Movie',
    year: 2024,
    rating: 0,
    status: 'Plan to Watch',
    image: '🎬'
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchContent()
  }, [isAuthenticated, navigate])

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await movieAPI.getAll()
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
        setContent(sortedData)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch movies/series data')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (data) => {
    try {
      setError('')
      setLoading(true)
      
      // Valid status enum values
      const validStatuses = ['Watching', 'Watched', 'Completed', 'Plan to Watch']
      
      const newContent = data.map((item) => {
        // Get status and validate it
        let statusValue = item.status || item['Status'] || 'Plan to Watch'
        
        // Normalize status - if it's not a valid enum value, default to 'Plan to Watch'
        if (!validStatuses.includes(statusValue)) {
          // Map common variations to valid values
          const statusMap = {
            'watching': 'Watching',
            'watched': 'Watched',
            'completed': 'Completed',
            'plan to watch': 'Plan to Watch',
            'plan-to-watch': 'Plan to Watch',
            'Plan to Watch': 'Plan to Watch'
          }
          
          const normalizedStatus = statusMap[statusValue.toLowerCase()] || 'Plan to Watch'
          statusValue = normalizedStatus
        }
        
        // Validate type
        let typeValue = item.type || item['Type'] || item.category || 'Movie'
        if (typeValue !== 'Movie' && typeValue !== 'Series' && typeValue !== 'K Drama') {
          // Normalize common variations
          const typeMap = {
            'k drama': 'K Drama',
            'k-drama': 'K Drama',
            'kdrama': 'K Drama',
            'K-Drama': 'K Drama',
            'movie': 'Movie',
            'series': 'Series'
          }
          typeValue = typeMap[typeValue.toLowerCase()] || 'Movie'
        }
        
        return {
          title: item.title || item.name || item['Title'] || `Content`,
          type: typeValue,
          year: parseInt(item.year || item['Year'] || 2024),
          rating: parseInt(item.rating || item['Rating'] || item.score || 0),
          status: statusValue,
          image: item.image || item['Image'] || '🎬'
        }
      })
      
      // Create all content via API
      for (const contentData of newContent) {
        await movieAPI.create(contentData)
      }
      
      // Refresh the list
      await fetchContent()
    } catch (err) {
      setError(err.message || 'Failed to upload movies/series data')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddContent = async (e) => {
    e.preventDefault()
    if (!newContent.title) return
    
    try {
      setError('')
      
      // Validate status and type
      const validStatuses = ['Watching', 'Watched', 'Completed', 'Plan to Watch']
      const statusValue = validStatuses.includes(newContent.status) 
        ? newContent.status 
        : 'Plan to Watch'
      
      const typeValue = (newContent.type === 'Movie' || newContent.type === 'Series' || newContent.type === 'K Drama') 
        ? newContent.type 
        : 'Movie'
      
      const contentData = {
        ...newContent,
        status: statusValue,
        type: typeValue,
        year: parseInt(newContent.year || 2024),
        rating: parseInt(newContent.rating || 0)
      }
      
      await movieAPI.create(contentData)
      
      // Refresh the list
      await fetchContent()
      
      setShowAddModal(false)
      setNewContent({
        title: '',
        type: 'Movie',
        year: 2024,
        rating: 0,
        status: 'Plan to Watch',
        image: '🎬'
      })
    } catch (err) {
      setError(err.message || 'Failed to add content')
      console.error('Add content error:', err)
    }
  }

  const handleEditContent = (item) => {
    setEditingContent(item)
    setNewContent({
      title: item.title || '',
      type: item.type || 'Movie',
      year: item.year || 2024,
      rating: item.rating || 0,
      status: item.status || 'Plan to Watch',
      image: item.image || '🎬'
    })
    setShowEditModal(true)
  }

  const handleUpdateContent = async (e) => {
    e.preventDefault()
    if (!editingContent || !newContent.title) return
    
    try {
      setError('')
      
      // Validate status and type
      const validStatuses = ['Watching', 'Watched', 'Completed', 'Plan to Watch']
      const statusValue = validStatuses.includes(newContent.status) 
        ? newContent.status 
        : 'Plan to Watch'
      
      const typeValue = (newContent.type === 'Movie' || newContent.type === 'Series' || newContent.type === 'K Drama') 
        ? newContent.type 
        : 'Movie'
      
      const contentData = {
        ...newContent,
        status: statusValue,
        type: typeValue,
        year: parseInt(newContent.year || 2024),
        rating: parseInt(newContent.rating || 0)
      }
      
      await movieAPI.update(editingContent.id, contentData)
      
      // Refresh the list
      await fetchContent()
      
      setShowEditModal(false)
      setEditingContent(null)
      setNewContent({
        title: '',
        type: 'Movie',
        year: 2024,
        rating: 0,
        status: 'Plan to Watch',
        image: '🎬'
      })
    } catch (err) {
      setError(err.message || 'Failed to update content')
      console.error('Update error:', err)
    }
  }

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return
    
    try {
      setError('')
      await movieAPI.delete(id)
      
      // Refresh the list
      await fetchContent()
    } catch (err) {
      setError(err.message || 'Failed to delete content')
      console.error('Delete error:', err)
    }
  }

  const statusColors = {
    'Watching': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    'Watched': 'bg-green-500/20 text-green-300 border-green-500/50',
    'Completed': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    'Plan to Watch': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
  }

  // Filter content based on active tab
  const filteredContent = activeTab === 'All' 
    ? content 
    : activeTab === 'Movies'
    ? content.filter(item => item.type === 'Movie')
    : activeTab === 'Series'
    ? content.filter(item => item.type === 'Series')
    : activeTab === 'K Drama'
    ? content.filter(item => item.type === 'K Drama')
    : activeTab === 'Watching'
    ? content.filter(item => item.status === 'Watching')
    : activeTab === 'Watched'
    ? content.filter(item => item.status === 'Watched')
    : content

  if (loading && content.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading movies/series...</div>
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
              <span className="text-6xl">🎬</span>
              Movies & Web Series
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Your personal cinema collection
            </p>
          </div>
          <div className="flex gap-3">
            <UploadButton
              onUpload={handleUpload}
              acceptedTypes={['.xlsx', '.xls', '.csv']}
              title="Upload Movies & Series Data"
              buttonText="Upload"
              gradient="from-blue-500 to-cyan-500"
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add New Content</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
        {['K Drama', 'All', 'Movies', 'Series', 'Watching', 'Watched'].map((filter, index) => (
          <motion.button
            key={filter}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setActiveTab(filter)}
            className={`px-6 py-2 rounded-full whitespace-nowrap hover:scale-105 transition-all duration-300 ${
              activeTab === filter
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'glass-strong hover:bg-white/20 dark:hover:bg-black/20'
            }`}
          >
            {filter}
          </motion.button>
        ))}
      </div>

      {filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredContent.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card group hover:scale-105 transition-transform duration-300 relative"
          >
            {/* Edit and Delete Icons */}
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <button
                onClick={() => handleEditContent(item)}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteContent(item.id)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-110"
                title="Delete"
              >
                🗑️
              </button>
            </div>
            <div className="text-6xl mb-4 text-center">{item.image}</div>
            <h3 className="text-base font-bold mb-2 text-slate-800 dark:text-slate-200">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[item.status]}`}>
                {item.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium glass-strong">
                {item.type}
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Year:</span>
                <span className="font-semibold">{item.year}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rating:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < item.rating / 2 ? 'text-yellow-400' : 'text-slate-400'}>
                      ★
                    </span>
                  ))}
                  <span className="ml-2 font-semibold">{item.rating}/10</span>
                </div>
              </div>
            </div>
          </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card text-center py-12"
        >
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">
            No content found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            No content in the "{activeTab}" category yet.
          </p>
        </motion.div>
      )}

      {/* Add Content Modal */}
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
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Add New Content</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Fill the details and save.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContent} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                name="title"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                placeholder="Title*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={newContent.type}
                onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Movie">Movie</option>
                <option value="Series">Series</option>
                <option value="K Drama">K Drama</option>
              </select>
              <input
                name="year"
                type="number"
                value={newContent.year}
                onChange={(e) => setNewContent({ ...newContent, year: parseInt(e.target.value) || 2024 })}
                placeholder="Year"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={newContent.status}
                onChange={(e) => setNewContent({ ...newContent, status: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                value={newContent.rating}
                onChange={(e) => setNewContent({ ...newContent, rating: parseInt(e.target.value) || 0 })}
                placeholder="Rating (0-10)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                name="image"
                value={newContent.image}
                onChange={(e) => setNewContent({ ...newContent, image: e.target.value || '🎬' })}
                placeholder="Image URL or Emoji"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 glow-on-hover"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Content Modal */}
      {showEditModal && editingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditingContent(null) }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass-card w-full max-w-2xl p-6 z-10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Edit Content</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Update the details and save.</p>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingContent(null) }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateContent} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                name="title"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                placeholder="Title*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={newContent.type}
                onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Movie">Movie</option>
                <option value="Series">Series</option>
                <option value="K Drama">K Drama</option>
              </select>
              <input
                name="year"
                type="number"
                value={newContent.year}
                onChange={(e) => setNewContent({ ...newContent, year: parseInt(e.target.value) || 2024 })}
                placeholder="Year"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={newContent.status}
                onChange={(e) => setNewContent({ ...newContent, status: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                value={newContent.rating}
                onChange={(e) => setNewContent({ ...newContent, rating: parseInt(e.target.value) || 0 })}
                placeholder="Rating (0-10)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                name="image"
                value={newContent.image}
                onChange={(e) => setNewContent({ ...newContent, image: e.target.value || '🎬' })}
                placeholder="Image URL or Emoji"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingContent(null) }}
                  className="px-4 py-2 rounded-lg bg-white/20 dark:bg-black/20 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 glow-on-hover"
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

export default MoviesSeries

