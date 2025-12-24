import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import UploadButton from '../components/UploadButton'
import { genshinAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const GenshinImpact = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    element: 'Cyro',
    tier: 'S',
    type: '',
    type2: '',
    weapon: 'Sword',
    rarity: 5,
    characterLevel: 90,
    characterOwned: 'Yes',
    constellation: 0,
    image: '⚔️',
  })
  const [characters, setCharacters] = useState([])

  // Fetch characters data from API
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchCharacters()
  }, [isAuthenticated, navigate])

  const fetchCharacters = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await genshinAPI.getAll()
      if (response.success) {
        // Map MongoDB _id to id for compatibility
        const mappedData = response.data.map(item => ({
          ...item,
          id: item._id,
          level: item.characterLevel || item.level || 1
        }))
        // Sort alphabetically by character name
        const sortedData = mappedData.sort((a, b) => {
          const nameA = (a.characterName || a.name || '').toLowerCase()
          const nameB = (b.characterName || b.name || '').toLowerCase()
          return nameA.localeCompare(nameB)
        })
        setCharacters(sortedData)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch characters data')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (data) => {
    try {
      setError('')
      const newCharacters = data.map((item) => ({
        name: item.Character || item.character || item.name || item['Name'] || `Character`,
        element: item.Element || item.element || 'Anemo',
        tier: item.Tier || item.tier || '',
        type: item.Type || item.type || '',
        type2: item['Type 2'] || item['Type2'] || item.type2 || '',
        rarity: parseInt(item['Rarity Star'] || item.rarity || item['Rarity'] || item.stars || 4),
        weapon: item.Weapon || item.weapon || '',
        rating: item.Rating || item.rating || '',
        levelType: item['Level Type'] || item['LevelType'] || item.levelType || '',
        characterLevel: parseInt(item['Character Level'] || item['CharacterLevel'] || item.characterLevel || item['Level'] || 1),
        characterOwned: item['Character Owned'] || item['CharacterOwned'] || item.characterOwned || item['Owned'] || 'Yes',
        constellation: parseInt(item.constellation || item['Constellation'] || item['C'] || 0),
        image: item.image || item['Image'] || '⚔️',
        adventureRank: parseInt(item.adventureRank || item['Adventure Rank'] || item['AR'] || 1),
      }))
      
      // Create all characters via API
      for (const charData of newCharacters) {
        await genshinAPI.create(charData)
      }
      
      // Refresh the list
      await fetchCharacters()
    } catch (err) {
      setError(err.message || 'Failed to upload characters')
      console.error('Upload error:', err)
    }
  }

  const elementColors = {
    'Electro': 'from-purple-200 to-pink-200',
    'Geo': 'from-amber-200 to-yellow-200',
    'Pyro': 'from-red-200 to-orange-200',
    'Cyro': 'from-cyan-200 to-blue-200',
    'Hydro': 'from-blue-200 to-cyan-200',
    'Anemo': 'from-green-200 to-emerald-200',
    'Dendro': 'from-green-200 to-lime-200',
  }

  // Element images mapping - images are in public/elements/ folder
  const elementImages = {
    'Cyro': '/elements/Cryo 1.png',  // File is "Cryo 1.png" (note: 'r' in filename, 'y' in element name)
    'Electro': '/elements/Electro 1.png',
    'Pyro': '/elements/Pyro 1.png',
    'Hydro': '/elements/Hydro 1.png',
    'Dendro': '/elements/Dendro 1.png',
    'Geo': '/elements/Geo 1.png',
    'Anemo': '/elements/Anemo 1.png'
  }

  const tabs = ['All', 'Cyro', 'Electro', 'Pyro', 'Hydro', 'Dendro', 'Geo']
  const weaponOptions = ['Catalysts', 'Polearms', 'Claymores', 'Bows', 'Swords']
  const tierOptions = ['SS', 'S', 'A', 'B', 'C', 'D', 'E', 'F']
  const elementOptions = ['Cyro', 'Electro', 'Pyro', 'Hydro', 'Dendro', 'Geo', 'Anemo']
  const levelOptions = [10, 20, 40, 50, 60, 70, 80, 90]
  const constellationOptions = [0, 1, 2, 3, 4, 5, 6]
  const ownedOptions = ['Yes', 'No']

  // Filter characters based on active tab
  const filteredCharacters = activeTab === 'All' 
    ? characters 
    : characters.filter(char => char.element === activeTab)

  const searchedCharacters = filteredCharacters.filter((char) => {
    const q = search.toLowerCase()
    return (
      char.name.toLowerCase().includes(q) ||
      (char.element || '').toLowerCase().includes(q) ||
      (char.tier || '').toLowerCase().includes(q) ||
      (char.type || '').toLowerCase().includes(q) ||
      (char.weapon || '').toLowerCase().includes(q)
    )
  })

  const closeModal = () => setShowAddModal(false)
  const isList = viewMode === 'list'

  // Helper function to check if image is a URL
  const isImageUrl = (image) => {
    if (!image) return false
    return image.startsWith('http://') || image.startsWith('https://') || image.startsWith('//')
  }

  const handleAddCharacter = async (e) => {
    e.preventDefault()
    if (!newCharacter.name) return
    
    try {
      setError('')
      const characterData = {
        ...newCharacter,
        rarity: parseInt(newCharacter.rarity || 4),
        characterLevel: parseInt(newCharacter.characterLevel || 1),
        constellation: parseInt(newCharacter.constellation || 0),
      }
      
      await genshinAPI.create(characterData)
      
      // Refresh the list
      await fetchCharacters()
      
      setShowAddModal(false)
      setNewCharacter({
        name: '',
        element: 'Cyro',
        tier: 'S',
        type: '',
        type2: '',
        weapon: 'Sword',
        rarity: 5,
        characterLevel: 90,
        characterOwned: 'Yes',
        constellation: 0,
        image: '⚔️',
      })
    } catch (err) {
      setError(err.message || 'Failed to add character')
      console.error('Add character error:', err)
    }
  }

  const handleCardUpdate = async (id, field, value) => {
    try {
      setError('')
      await genshinAPI.update(id, { [field]: value })
      
      // Update local state
      setCharacters((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      )
    } catch (err) {
      setError(err.message || 'Failed to update character')
      console.error('Update error:', err)
    }
  }

  const handleEditCharacter = (char) => {
    setEditingCharacter(char)
    setNewCharacter({
      name: char.name || '',
      element: char.element || 'Cryo',
      tier: char.tier || 'S',
      type: char.type || '',
      type2: char.type2 || '',
      weapon: char.weapon || 'Sword',
      rarity: char.rarity || 5,
      characterLevel: char.characterLevel || char.level || 90,
      characterOwned: char.characterOwned || 'Yes',
      constellation: char.constellation || 0,
      image: char.image || '⚔️',
    })
    setShowEditModal(true)
  }

  const handleUpdateCharacter = async (e) => {
    e.preventDefault()
    if (!editingCharacter || !newCharacter.name) return
    
    try {
      setError('')
      const characterData = {
        ...newCharacter,
        rarity: parseInt(newCharacter.rarity || 4),
        characterLevel: parseInt(newCharacter.characterLevel || 1),
        constellation: parseInt(newCharacter.constellation || 0),
      }
      
      await genshinAPI.update(editingCharacter.id, characterData)
      
      // Refresh the list
      await fetchCharacters()
      
      setShowEditModal(false)
      setEditingCharacter(null)
      setNewCharacter({
        name: '',
        element: 'Cyro',
        tier: 'S',
        type: '',
        type2: '',
        weapon: 'Sword',
        rarity: 5,
        characterLevel: 90,
        characterOwned: 'Yes',
        constellation: 0,
        image: '⚔️',
      })
    } catch (err) {
      setError(err.message || 'Failed to update character')
      console.error('Update character error:', err)
    }
  }

  const handleDeleteCharacter = async (id) => {
    if (!window.confirm('Are you sure you want to delete this character?')) return
    
    try {
      setError('')
      await genshinAPI.delete(id)
      
      // Refresh the list
      await fetchCharacters()
    } catch (err) {
      setError(err.message || 'Failed to delete character')
      console.error('Delete character error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading characters...</div>
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
              <span className="text-6xl">⚔️</span>
              Genshin Impact
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Character builds and progress tracker
            </p>
          </div>
          <div className="flex gap-3">
            <UploadButton
              onUpload={handleUpload}
              acceptedTypes={['.xlsx', '.xls', '.csv']}
              title="Upload Genshin Impact Characters"
              buttonText="Upload"
              gradient="from-amber-500 to-orange-500"
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-amber-500/50 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add Character</span>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => navigate('/genshin/feature')}
              className="glass-strong px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
            >
              View Stats
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
          {/* Element Tabs - Left Side */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
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
            placeholder="Search by name, element, tier, type, weapon"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          
          {/* View Toggle Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'bg-white/10 dark:bg-black/10 text-slate-700 dark:text-slate-300'}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'bg-white/10 dark:bg-black/10 text-slate-700 dark:text-slate-300'}`}
            >
              List View
            </button>
          </div>
        </div>
      </motion.div>

      {/* Characters Grid */}
      <div className="mb-3">
        <h2 className="text-base font-bold mb-4 text-slate-800 dark:text-slate-200">My Characters</h2>
        {searchedCharacters.length > 0 ? (
          <div className={isList ? 'flex flex-col gap-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'}>
            {searchedCharacters.map((char, index) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card group transition-transform duration-300 relative ${isList ? 'p-4 flex gap-4 items-center shadow-lg hover:shadow-xl border border-slate-200/50 dark:border-slate-700/50' : 'hover:scale-105'}`}
            >
              {/* Edit and Delete Icons */}
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button
                  onClick={() => handleEditCharacter(char)}
                  className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteCharacter(char.id)}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-110"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
              <div className={`${isList ? 'flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br ${elementColors[char.element]} flex items-center justify-center shadow-md' : `w-full h-32 rounded-xl bg-gradient-to-br ${elementColors[char.element]} flex items-center justify-center mb-4 overflow-hidden relative`}`}>
                {isImageUrl(char.image) ? (
                  <>
                    <img 
                      src={char.image} 
                      alt={char.name}
                      className={isList ? 'w-16 h-16 object-cover rounded' : 'w-full h-full object-cover'}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        const fallback = e.target.parentElement.querySelector('.emoji-fallback')
                        if (fallback) fallback.style.display = 'block'
                      }}
                    />
                    <span className={`emoji-fallback hidden ${isList ? 'text-4xl' : 'text-6xl'}`}>{'⚔️'}</span>
                  </>
                ) : (
                  <>
                    {/* Show element image if available, otherwise show emoji */}
                    {char.element && elementImages[char.element] ? (
                      <>
                        <img 
                          src={elementImages[char.element]} 
                          alt={char.element}
                          className={isList ? 'w-full h-full object-contain p-2' : 'w-full h-full object-contain p-4'}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            const fallback = e.target.parentElement.querySelector('.element-emoji-fallback')
                            if (fallback) fallback.style.display = 'block'
                          }}
                        />
                        <span className={`element-emoji-fallback hidden ${isList ? 'text-4xl' : 'text-6xl'}`}>{char.image || '⚔️'}</span>
                      </>
                    ) : (
                      <span className={isList ? 'text-4xl' : 'text-6xl'}>{char.image || '⚔️'}</span>
                    )}
                  </>
                )}
              </div>
              <div className={`${isList ? 'flex-1 min-w-0' : ''}`}>
                <h3 className={`text-base font-bold text-slate-800 dark:text-slate-200 ${isList ? 'mb-2' : 'mb-2'}`}>
                  {char.name}
                </h3>
                <div className={`${isList ? 'grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm' : 'space-y-2 text-sm'}`}>
                  <div className={`flex justify-between items-center ${isList ? '' : ''}`}>
                    <span className="text-slate-600 dark:text-slate-400">Tier</span>
                    <span className="font-semibold">{char.tier || '-'}</span>
                  </div>
                  <div className={`flex justify-between items-center ${isList ? '' : ''}`}>
                    <span className="text-slate-600 dark:text-slate-400">Element</span>
                    <span className="font-semibold">{char.element}</span>
                  </div>
                  <div className={`flex justify-between items-center ${isList ? '' : ''}`}>
                    <span className="text-slate-600 dark:text-slate-400">Type</span>
                    <span className="font-semibold">{char.type || '-'}</span>
                  </div>
                  <div className={`flex justify-between items-center ${isList ? '' : ''}`}>
                    <span className="text-slate-600 dark:text-slate-400">Type 2</span>
                    <span className="font-semibold">{char.type2 || '-'}</span>
                  </div>
                  <div className={`flex justify-between items-center ${isList ? '' : ''}`}>
                    <span className="text-slate-600 dark:text-slate-400">Weapon</span>
                    <span className="font-semibold">{char.weapon || '-'}</span>
                  </div>
                  <div className={`flex justify-between items-center ${isList ? '' : ''}`}>
                    <span className="text-slate-600 dark:text-slate-400">Rarity Star</span>
                    <div className="flex gap-1">
                      {[...Array(char.rarity)].map((_, i) => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                  </div>
                  {char.rating && (
                    <div className={`flex justify-between items-center ${isList ? '' : ''}`}>
                      <span className="text-slate-600 dark:text-slate-400">Rating</span>
                      <span className="font-semibold">{char.rating}</span>
                    </div>
                  )}
                  {char.levelType && (
                    <div className={`flex justify-between items-center ${isList ? '' : ''}`}>
                      <span className="text-slate-600 dark:text-slate-400">Level Type</span>
                      <span className="font-semibold">{char.levelType}</span>
                    </div>
                  )}
                  <div className={`flex justify-between items-center gap-2 ${isList ? '' : ''}`}>
                    <span className="text-slate-600 dark:text-slate-400">Constellation</span>
                    <select
                      value={char.constellation ?? 0}
                      onChange={(e) => handleCardUpdate(char.id, 'constellation', parseInt(e.target.value))}
                      className="px-2 py-1 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {constellationOptions.map((c) => (
                        <option key={c} value={c}>C{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className={`flex justify-between items-center gap-2 ${isList ? '' : ''}`}>
                    <span className="text-slate-600 dark:text-slate-400">Character Level</span>
                    <select
                      value={char.characterLevel ?? char.level ?? 1}
                      onChange={(e) => handleCardUpdate(char.id, 'characterLevel', parseInt(e.target.value))}
                      className="px-2 py-1 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {levelOptions.map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                  <div className={`flex justify-between items-center gap-2 ${isList ? '' : ''}`}>
                    <span className="text-slate-600 dark:text-slate-400">Character Owned</span>
                    <select
                      value={char.characterOwned || 'No'}
                      onChange={(e) => handleCardUpdate(char.id, 'characterOwned', e.target.value)}
                      className="px-2 py-1 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {ownedOptions.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
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
              No characters found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              No characters with {activeTab} element yet.
            </p>
          </motion.div>
        )}
      </div>

      {/* Add Character Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass-card w-full max-w-4xl p-6 z-10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Add Character</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Fill the details and save.</p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCharacter} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                name="name"
                value={newCharacter.name}
                onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                placeholder="Character name*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <select
                value={newCharacter.element}
                onChange={(e) => setNewCharacter({ ...newCharacter, element: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {elementOptions.map((el) => (
                  <option key={el} value={el}>{el}</option>
                ))}
              </select>

              <select
                value={newCharacter.tier}
                onChange={(e) => setNewCharacter({ ...newCharacter, tier: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {tierOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={newCharacter.weapon}
                onChange={(e) => setNewCharacter({ ...newCharacter, weapon: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {weaponOptions.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>

              <input
                name="type"
                value={newCharacter.type}
                onChange={(e) => setNewCharacter({ ...newCharacter, type: e.target.value })}
                placeholder="Type"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <input
                name="type2"
                value={newCharacter.type2}
                onChange={(e) => setNewCharacter({ ...newCharacter, type2: e.target.value })}
                placeholder="Type 2"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <input
                name="characterLevel"
                type="number"
                min="1"
                max="90"
                value={newCharacter.characterLevel}
                onChange={(e) => setNewCharacter({ ...newCharacter, characterLevel: e.target.value })}
                placeholder="Character Level (1-90)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <select
                value={newCharacter.characterOwned}
                onChange={(e) => setNewCharacter({ ...newCharacter, characterOwned: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {ownedOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              <input
                name="constellation"
                type="number"
                value={newCharacter.constellation}
                onChange={(e) => setNewCharacter({ ...newCharacter, constellation: e.target.value })}
                placeholder="Constellation (0-6)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <select
                value={newCharacter.rarity}
                onChange={(e) => setNewCharacter({ ...newCharacter, rarity: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {[5,4,3].map((r) => (
                  <option key={r} value={r}>{r}★</option>
                ))}
              </select>

              <input
                name="image"
                value={newCharacter.image}
                onChange={(e) => setNewCharacter({ ...newCharacter, image: e.target.value || '⚔️' })}
                placeholder="Image URL or Emoji (e.g. https://example.com/image.jpg or ⚔️)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 glow-on-hover"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Character Modal */}
      {showEditModal && editingCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditingCharacter(null) }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass-card w-full max-w-4xl p-6 z-10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Edit Character</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Update the details and save.</p>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingCharacter(null) }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCharacter} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                name="name"
                value={newCharacter.name}
                onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                placeholder="Character name*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <select
                value={newCharacter.element}
                onChange={(e) => setNewCharacter({ ...newCharacter, element: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {elementOptions.map((el) => (
                  <option key={el} value={el}>{el}</option>
                ))}
              </select>

              <select
                value={newCharacter.tier}
                onChange={(e) => setNewCharacter({ ...newCharacter, tier: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {tierOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={newCharacter.weapon}
                onChange={(e) => setNewCharacter({ ...newCharacter, weapon: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {weaponOptions.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>

              <input
                name="type"
                value={newCharacter.type}
                onChange={(e) => setNewCharacter({ ...newCharacter, type: e.target.value })}
                placeholder="Type"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <input
                name="type2"
                value={newCharacter.type2}
                onChange={(e) => setNewCharacter({ ...newCharacter, type2: e.target.value })}
                placeholder="Type 2"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <input
                name="characterLevel"
                type="number"
                min="1"
                max="90"
                value={newCharacter.characterLevel}
                onChange={(e) => setNewCharacter({ ...newCharacter, characterLevel: e.target.value })}
                placeholder="Character Level (1-90)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <select
                value={newCharacter.characterOwned}
                onChange={(e) => setNewCharacter({ ...newCharacter, characterOwned: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {ownedOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>

              <input
                name="constellation"
                type="number"
                value={newCharacter.constellation}
                onChange={(e) => setNewCharacter({ ...newCharacter, constellation: e.target.value })}
                placeholder="Constellation (0-6)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <select
                value={newCharacter.rarity}
                onChange={(e) => setNewCharacter({ ...newCharacter, rarity: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {[5,4,3].map((r) => (
                  <option key={r} value={r}>{r}★</option>
                ))}
              </select>

              <input
                name="image"
                value={newCharacter.image}
                onChange={(e) => setNewCharacter({ ...newCharacter, image: e.target.value || '⚔️' })}
                placeholder="Image URL or Emoji (e.g. https://example.com/image.jpg or ⚔️)"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingCharacter(null) }}
                  className="px-4 py-2 rounded-lg bg-white/20 dark:bg-black/20 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 glow-on-hover"
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

export default GenshinImpact


