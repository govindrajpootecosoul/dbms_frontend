import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import UploadButton from '../components/UploadButton'
import { animeAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const AnimeTracker = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All list')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAnime, setEditingAnime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newAnime, setNewAnime] = useState({
    anime: '',
    animeOtherName: '',
    animeType: '',
    airingStatus: '',
    watchStatus: 'Watch Later',
    websiteLink: '',
    animeSchedule: '',
    genres: '',
    episodeOn: '',
    totalEpisode: '',
    image: '🎌',
  })
  const [animeList, setAnimeList] = useState([])

  // Fetch anime data from API
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchAnime()
  }, [isAuthenticated, navigate])

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
        // Sort alphabetically by anime name
        const sortedData = mappedData.sort((a, b) => {
          const nameA = (a.anime || '').toLowerCase()
          const nameB = (b.anime || '').toLowerCase()
          return nameA.localeCompare(nameB)
        })
        setAnimeList(sortedData)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch anime data')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (data) => {
    try {
      setError('')
      setLoading(true)
      
      // Valid watchStatus enum values
      const validWatchStatuses = ['Watch Later', 'Watching', 'Dropped', 'Completed', 'On Hold', 'Yet to Air']
      
      // Map uploaded data to anime format
      const newAnimeData = data.map((item) => {
        // Get watchStatus and validate it
        let watchStatusValue = item.watchStatus || item['Watch Status'] || item.status || 'Watch Later'
        
        // Normalize watchStatus - if it's not a valid enum value, default to 'Watch Later'
        // Also handle common variations
        if (!validWatchStatuses.includes(watchStatusValue)) {
          // Map common variations to valid values
          const statusMap = {
            'ongoing': 'Watching',
            'Ongoing': 'Watching',
            'on-going': 'Watching',
            'On-Going': 'Watching',
            'plan to watch': 'Watch Later',
            'Plan to Watch': 'Watch Later',
            'plan-to-watch': 'Watch Later',
            'watching': 'Watching',
            'completed': 'Completed',
            'dropped': 'Dropped',
            'on hold': 'On Hold',
            'On Hold': 'On Hold',
            'on-hold': 'On Hold',
            'yet to air': 'Yet to Air',
            'Yet to Air': 'Yet to Air',
            'yet-to-air': 'Yet to Air'
          }
          
          const normalizedStatus = statusMap[watchStatusValue] || 'Watch Later'
          watchStatusValue = normalizedStatus
        }
        
        return {
          anime: item.anime || item['Anime'] || item.title || item.name || `Anime`,
          animeOtherName: item.animeOtherName || item['Anime other Name'] || item['Anime Other Name'] || '',
          animeType: item.animeType || item['anime type'] || item['Anime Type'] || '',
          airingStatus: item.airingStatus || item['Airing Status'] || '',
          watchStatus: watchStatusValue,
          websiteLink: item.websiteLink || item['Website Link'] || '',
          animeSchedule: item.animeSchedule || item['Anime Schedule'] || '',
          genres: item.genres || item['Genres'] || '',
          episodeOn: parseInt(item.episodeOn || item['episode on'] || item['Episode On'] || item.episodes || 0),
          totalEpisode: parseInt(item.totalEpisode || item['total Episode'] || item['Total Episode'] || item['Total Episodes'] || 0),
          image: item.image || item['Image'] || '🎌'
        }
      })
      
      // Create all anime via API
      for (const animeData of newAnimeData) {
        await animeAPI.create(animeData)
      }
      
      // Refresh the list
      await fetchAnime()
    } catch (err) {
      setError(err.message || 'Failed to upload anime data')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, nextStatus) => {
    if (!nextStatus) return
    try {
      setError('')
      const anime = animeList.find(a => a.id === id)
      if (!anime) return

      await animeAPI.update(id, { watchStatus: nextStatus })
      
      // Update local state
      setAnimeList((prev) =>
        prev.map((anime) =>
          anime.id === id ? { ...anime, watchStatus: nextStatus } : anime
        )
      )
    } catch (err) {
      setError(err.message || 'Failed to update status')
      console.error('Update status error:', err)
    }
  }

  const handleAiringStatusChange = async (id, airingStatus) => {
    try {
      setError('')
      await animeAPI.update(id, { airingStatus: airingStatus })
      
      // Update local state
      setAnimeList((prev) =>
        prev.map((anime) =>
          anime.id === id ? { ...anime, airingStatus: airingStatus } : anime
        )
      )
    } catch (err) {
      setError(err.message || 'Failed to update airing status')
      console.error('Update airing status error:', err)
    }
  }

  const airingStatusOptions = ['Completed', 'YTA', 'Ongoing']

  const handleAddAnime = async (e) => {
    e.preventDefault()
    if (!newAnime.anime) return
    
    try {
      setError('')
      
      // Validate watchStatus
      const validWatchStatuses = ['Watch Later', 'Watching', 'Dropped', 'Completed', 'On Hold', 'Yet to Air']
      const watchStatusValue = validWatchStatuses.includes(newAnime.watchStatus) 
        ? newAnime.watchStatus 
        : 'Watch Later'
      
      const animeData = {
        ...newAnime,
        watchStatus: watchStatusValue,
        episodeOn: parseInt(newAnime.episodeOn || 0),
        totalEpisode: parseInt(newAnime.totalEpisode || 0),
      }
      
      await animeAPI.create(animeData)
      
      // Refresh the list
      await fetchAnime()
      
      setShowAddModal(false)
      setNewAnime({
        anime: '',
        animeOtherName: '',
        animeType: '',
        airingStatus: '',
        watchStatus: 'Watch Later',
        websiteLink: '',
        animeSchedule: '',
        genres: '',
        episodeOn: '',
        totalEpisode: '',
        image: '🎌',
      })
    } catch (err) {
      setError(err.message || 'Failed to add anime')
      console.error('Add anime error:', err)
    }
  }

  const handleEditAnime = (anime) => {
    setEditingAnime(anime)
    setNewAnime({
      anime: anime.anime || '',
      animeOtherName: anime.animeOtherName || '',
      animeType: anime.animeType || '',
      airingStatus: anime.airingStatus || '',
      watchStatus: anime.watchStatus || 'Watch Later',
      websiteLink: anime.websiteLink || '',
      animeSchedule: anime.animeSchedule || '',
      genres: anime.genres || '',
      episodeOn: anime.episodeOn || '',
      totalEpisode: anime.totalEpisode || '',
      image: anime.image || '🎌',
    })
    setShowEditModal(true)
  }

  const handleUpdateAnime = async (e) => {
    e.preventDefault()
    if (!editingAnime || !newAnime.anime) return
    
    try {
      setError('')
      
      // Validate watchStatus
      const validWatchStatuses = ['Watch Later', 'Watching', 'Dropped', 'Completed', 'On Hold', 'Yet to Air']
      const watchStatusValue = validWatchStatuses.includes(newAnime.watchStatus) 
        ? newAnime.watchStatus 
        : 'Watch Later'
      
      const animeData = {
        ...newAnime,
        watchStatus: watchStatusValue,
        episodeOn: parseInt(newAnime.episodeOn || 0),
        totalEpisode: parseInt(newAnime.totalEpisode || 0),
      }
      
      await animeAPI.update(editingAnime.id, animeData)
      
      // Refresh the list
      await fetchAnime()
      
      setShowEditModal(false)
      setEditingAnime(null)
      setNewAnime({
        anime: '',
        animeOtherName: '',
        animeType: '',
        airingStatus: '',
        watchStatus: 'Watch Later',
        websiteLink: '',
        animeSchedule: '',
        genres: '',
        episodeOn: '',
        totalEpisode: '',
        image: '🎌',
      })
    } catch (err) {
      setError(err.message || 'Failed to update anime')
      console.error('Update anime error:', err)
    }
  }

  const handleDeleteAnime = async (id) => {
    if (!window.confirm('Are you sure you want to delete this anime?')) return
    
    try {
      setError('')
      await animeAPI.delete(id)
      
      // Refresh the list
      await fetchAnime()
    } catch (err) {
      setError(err.message || 'Failed to delete anime')
      console.error('Delete anime error:', err)
    }
  }

  const statusColors = {
    'Watching': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    'Completed': 'bg-green-500/20 text-green-300 border-green-500/50',
    'On Hold': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    'Dropped': 'bg-red-500/20 text-red-300 border-red-500/50',
    'Watch Later': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    'Yet to Air': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
  }

  const statusGradients = {
    'Watching': 'from-blue-500 to-cyan-500',
    'Completed': 'from-green-500 to-emerald-500',
    'On Hold': 'from-yellow-500 to-orange-500',
    'Dropped': 'from-red-500 to-rose-500',
    'Watch Later': 'from-purple-500 to-pink-500',
    'Yet to Air': 'from-indigo-500 to-blue-500',
  }

  const airingStatusColors = {
    'Completed': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
    'YTA': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    'Ongoing': 'bg-green-500/20 text-green-300 border-green-500/50',
  }

  const statusOptions = ['Watch Later', 'Watching', 'Dropped', 'Completed', 'On Hold', 'Yet to Air']

  const tabs = ['All list', 'Watch Later', 'Watching', 'Dropped', 'Completed', 'On Hold', 'Yet to Air']

  // Filter anime based on active tab
  const filteredAnime = activeTab === 'All list' 
    ? animeList 
    : animeList.filter(anime => anime.watchStatus === activeTab)

  const searchedAnime = filteredAnime.filter((anime) => {
    const q = search.toLowerCase()
    return (
      anime.anime.toLowerCase().includes(q) ||
      (anime.animeOtherName || '').toLowerCase().includes(q) ||
      (anime.genres || '').toLowerCase().includes(q) ||
      (anime.watchStatus || '').toLowerCase().includes(q)
    )
  })

  const closeModal = () => setShowAddModal(false)
  const isList = viewMode === 'list'

  // Helper function to check if image is a URL
  const isImageUrl = (image) => {
    if (!image) return false
    return image.startsWith('http://') || image.startsWith('https://') || image.startsWith('//')
  }

  return (
    <div className="max-w-7xl mx-auto">
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
              <span className="text-6xl">🎌</span>
              Anime Tracker
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Track your anime watching progress
            </p>
          </div>
          <div className="flex gap-3">
            <UploadButton
              onUpload={handleUpload}
              acceptedTypes={['.xlsx', '.xls', '.csv']}
              title="Upload Anime Data"
              buttonText="Upload"
              gradient="from-pink-500 to-rose-500"
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-pink-500/50 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add New Anime</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Search + View toggle + Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-3 mb-6"
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs - Left Side */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                    : 'bg-white/10 dark:bg-black/10 text-slate-700 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-black/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, other name, genre, status"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
          />
          
          {/* View Toggle Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'bg-white/10 dark:bg-black/10 text-slate-700 dark:text-slate-300'}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'bg-white/10 dark:bg-black/10 text-slate-700 dark:text-slate-300'}`}
            >
              List View
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-600 dark:text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card text-center py-12"
        >
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">
            Loading...
          </h3>
        </motion.div>
      ) : (
        <>
          {/* Anime Grid / List */}
          {searchedAnime.length > 0 ? (
        <div className={isList ? 'flex flex-col gap-2' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
          {searchedAnime.map((anime, index) => (
          <motion.div
            key={anime.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card group transition-transform duration-300 relative ${isList ? 'p-3 flex items-start gap-3' : 'hover:scale-105'}`}
          >
            {/* Edit and Delete Icons */}
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <button
                onClick={() => handleEditAnime(anime)}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteAnime(anime.id)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-110"
                title="Delete"
              >
                🗑️
              </button>
            </div>
            {/* Gradient Header with Icon/Image */}
            <div className={`${isList ? 'flex-shrink-0 text-4xl leading-none' : `w-full h-32 rounded-xl bg-gradient-to-br ${statusGradients[anime.watchStatus] || 'from-pink-500 to-rose-500'} flex items-center justify-center mb-4 overflow-hidden`}`}>
              {isImageUrl(anime.image) ? (
                <img 
                  src={anime.image} 
                  alt={anime.anime}
                  className={isList ? 'w-16 h-16 object-cover rounded' : 'w-full h-full object-cover'}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    const fallback = e.target.parentElement.querySelector('.emoji-fallback')
                    if (fallback) fallback.style.display = 'block'
                  }}
                />
              ) : (
                <span className={isList ? 'text-4xl' : 'text-6xl'}>{anime.image || '🎌'}</span>
              )}
              {isImageUrl(anime.image) && (
                <span className={`emoji-fallback hidden ${isList ? 'text-4xl' : 'text-6xl'}`}>{'🎌'}</span>
              )}
            </div>
            
            {/* Anime Title */}
            <div className={`${isList ? 'flex-1 min-w-0' : ''}`}>
              <h3 className={`text-base font-bold mb-1 text-slate-800 dark:text-slate-200 ${isList ? '' : 'mb-2'}`}>
                {anime.anime}
              </h3>
              
              {/* Other Name */}
              {anime.animeOtherName && (
                <p className={`text-xs text-slate-500 dark:text-slate-400 italic ${isList ? 'mb-2' : 'mb-2'}`}>
                  {anime.animeOtherName}
                </p>
              )}

              {/* Status Badges */}
              <div className={`flex ${isList ? 'flex-row flex-wrap gap-2 mb-2 items-center' : 'flex-wrap gap-2 mb-3'}`}>
              </div>

              {/* Details */}
              {isList ? (
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex flex-wrap gap-2 items-center">
                    {anime.animeType && (
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{anime.animeType}</span>
                    )}
                    {anime.animeSchedule && (
                      <span className="text-slate-500 dark:text-slate-400">· {anime.animeSchedule}</span>
                    )}
                    {anime.airingStatus && (
                      <span className="text-slate-500 dark:text-slate-400">· {anime.airingStatus}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Ep {anime.episodeOn ?? 0}
                      {anime.totalEpisode ? ` / ${anime.totalEpisode}` : ''}
                    </span>
                    {anime.genres && (
                      <span className="text-slate-500 dark:text-slate-400 truncate">
                        · {anime.genres}
                      </span>
                    )}
                    {anime.websiteLink && (
                      <a 
                        href={anime.websiteLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>🔗</span>
                        <span>Link</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  {/* Watch Status Dropdown */}
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <select
                      value={anime.watchStatus}
                      onChange={(e) => handleStatusChange(anime.id, e.target.value)}
                      className="px-2 py-1 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Airing Status Dropdown */}
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400">Airing Status</span>
                    <select
                      value={anime.airingStatus || ''}
                      onChange={(e) => handleAiringStatusChange(anime.id, e.target.value)}
                      className="px-2 py-1 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="">-</option>
                      {airingStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Anime Type */}
                  {anime.animeType && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Type</span>
                      <span className="font-semibold">{anime.animeType}</span>
                    </div>
                  )}

                  {/* Episode On */}
                  {anime.episodeOn !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Episode On</span>
                      <span className="font-semibold">{anime.episodeOn}</span>
                    </div>
                  )}

                  {/* Total Episode */}
                  {anime.totalEpisode !== undefined && anime.totalEpisode > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Total Episode</span>
                      <span className="font-semibold">{anime.totalEpisode}</span>
                    </div>
                  )}

                  {/* Anime Schedule */}
                  {anime.animeSchedule && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Schedule</span>
                      <span className="font-semibold">{anime.animeSchedule}</span>
                    </div>
                  )}

                  {/* Genres */}
                  {anime.genres && (
                    <div className="pt-2 border-t border-white/10 dark:border-white/5">
                      <div className="flex flex-wrap gap-1">
                        <span className="text-slate-600 dark:text-slate-400 mr-1">Genres:</span>
                        <span className="text-slate-700 dark:text-slate-300">{anime.genres}</span>
                      </div>
                    </div>
                  )}

                  {/* Website Link */}
                  {anime.websiteLink && (
                    <div className="pt-2">
                      <a 
                        href={anime.websiteLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline text-xs flex items-center gap-1 justify-center"
                      >
                        <span>🔗</span>
                        <span>Visit Website</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
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
            No anime found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            No anime in the "{activeTab}" category yet.
          </p>
        </motion.div>
      )}
        </>
      )}

      {/* Add Anime Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass-card w-full max-w-3xl p-6 z-10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Add New Anime</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Fill the details and save.</p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAnime} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                name="anime"
                value={newAnime.anime}
                onChange={(e) => setNewAnime({ ...newAnime, anime: e.target.value })}
                placeholder="Anime name*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="animeOtherName"
                value={newAnime.animeOtherName}
                onChange={(e) => setNewAnime({ ...newAnime, animeOtherName: e.target.value })}
                placeholder="Other name"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="animeType"
                value={newAnime.animeType}
                onChange={(e) => setNewAnime({ ...newAnime, animeType: e.target.value })}
                placeholder="Type (TV, Movie...)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <select
                name="airingStatus"
                value={newAnime.airingStatus}
                onChange={(e) => setNewAnime({ ...newAnime, airingStatus: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="">Select Airing Status</option>
                {airingStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                name="watchStatus"
                value={newAnime.watchStatus}
                onChange={(e) => setNewAnime({ ...newAnime, watchStatus: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                name="websiteLink"
                value={newAnime.websiteLink}
                onChange={(e) => setNewAnime({ ...newAnime, websiteLink: e.target.value })}
                placeholder="Website link"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="animeSchedule"
                value={newAnime.animeSchedule}
                onChange={(e) => setNewAnime({ ...newAnime, animeSchedule: e.target.value })}
                placeholder="Schedule (e.g. Sundays)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="genres"
                value={newAnime.genres}
                onChange={(e) => setNewAnime({ ...newAnime, genres: e.target.value })}
                placeholder="Genres"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="episodeOn"
                type="number"
                value={newAnime.episodeOn}
                onChange={(e) => setNewAnime({ ...newAnime, episodeOn: e.target.value })}
                placeholder="Episode on"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="totalEpisode"
                type="number"
                value={newAnime.totalEpisode}
                onChange={(e) => setNewAnime({ ...newAnime, totalEpisode: e.target.value })}
                placeholder="Total episodes"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="image"
                value={newAnime.image}
                onChange={(e) => setNewAnime({ ...newAnime, image: e.target.value || '🎌' })}
                placeholder="Image URL or Emoji (e.g. https://example.com/image.jpg or 🎌)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-white/20 dark:bg-black/20 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 glow-on-hover"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Anime Modal */}
      {showEditModal && editingAnime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditingAnime(null) }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass-card w-full max-w-3xl p-6 z-10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Edit Anime</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Update the details and save.</p>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingAnime(null) }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateAnime} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                name="anime"
                value={newAnime.anime}
                onChange={(e) => setNewAnime({ ...newAnime, anime: e.target.value })}
                placeholder="Anime name*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="animeOtherName"
                value={newAnime.animeOtherName}
                onChange={(e) => setNewAnime({ ...newAnime, animeOtherName: e.target.value })}
                placeholder="Other name"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="animeType"
                value={newAnime.animeType}
                onChange={(e) => setNewAnime({ ...newAnime, animeType: e.target.value })}
                placeholder="Type (TV, Movie...)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <select
                name="airingStatus"
                value={newAnime.airingStatus}
                onChange={(e) => setNewAnime({ ...newAnime, airingStatus: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="">Select Airing Status</option>
                {airingStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                name="watchStatus"
                value={newAnime.watchStatus}
                onChange={(e) => setNewAnime({ ...newAnime, watchStatus: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                name="websiteLink"
                value={newAnime.websiteLink}
                onChange={(e) => setNewAnime({ ...newAnime, websiteLink: e.target.value })}
                placeholder="Website link"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="animeSchedule"
                value={newAnime.animeSchedule}
                onChange={(e) => setNewAnime({ ...newAnime, animeSchedule: e.target.value })}
                placeholder="Schedule (e.g. Sundays)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="genres"
                value={newAnime.genres}
                onChange={(e) => setNewAnime({ ...newAnime, genres: e.target.value })}
                placeholder="Genres"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="episodeOn"
                type="number"
                value={newAnime.episodeOn}
                onChange={(e) => setNewAnime({ ...newAnime, episodeOn: e.target.value })}
                placeholder="Episode on"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="totalEpisode"
                type="number"
                value={newAnime.totalEpisode}
                onChange={(e) => setNewAnime({ ...newAnime, totalEpisode: e.target.value })}
                placeholder="Total episodes"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="image"
                value={newAnime.image}
                onChange={(e) => setNewAnime({ ...newAnime, image: e.target.value || '🎌' })}
                placeholder="Image URL or Emoji (e.g. https://example.com/image.jpg or 🎌)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingAnime(null) }}
                  className="px-4 py-2 rounded-lg bg-white/20 dark:bg-black/20 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 glow-on-hover"
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

export default AnimeTracker

