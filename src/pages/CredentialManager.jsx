import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import UploadButton from '../components/UploadButton'
import { credentialAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const CredentialManager = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCred, setEditingCred] = useState(null)
  const [newCred, setNewCred] = useState({
    service: '',
    username: '',
    password: '',
    category: 'Other'
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchCredentials()
  }, [isAuthenticated, navigate])

  const fetchCredentials = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await credentialAPI.getAll()
      if (response.success) {
        const mappedData = response.data.map(item => ({
          ...item,
          id: item._id
        }))
        // Sort alphabetically by platform/name
        const sortedData = mappedData.sort((a, b) => {
          const nameA = (a.platform || a.name || '').toLowerCase()
          const nameB = (b.platform || b.name || '').toLowerCase()
          return nameA.localeCompare(nameB)
        })
        setCredentials(sortedData)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch credentials data')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const togglePassword = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleUpload = async (data) => {
    try {
      setError('')
      setLoading(true)
      const newCredentials = data.map((item) => ({
        service: item.service || item['Service'] || item.name || `Service`,
        username: item.username || item['Username'] || item.email || item['Email'] || '',
        password: item.password || item['Password'] || 'password',
        category: item.category || item['Category'] || item.type || 'Other'
      }))
      
      // Create all credentials via API
      for (const credData of newCredentials) {
        await credentialAPI.create(credData)
      }
      
      // Refresh the list
      await fetchCredentials()
    } catch (err) {
      setError(err.message || 'Failed to upload credentials data')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCred = async (e) => {
    e.preventDefault()
    if (!newCred.service) return
    
    try {
      setError('')
      await credentialAPI.create(newCred)
      
      // Refresh the list
      await fetchCredentials()
      
      setShowAddModal(false)
      setNewCred({
        service: '',
        username: '',
        password: '',
        category: 'Other'
      })
    } catch (err) {
      setError(err.message || 'Failed to add credential')
      console.error('Add credential error:', err)
    }
  }

  const handleEditCred = (cred) => {
    setEditingCred(cred)
    setNewCred({
      service: cred.service || '',
      username: cred.username || '',
      password: cred.password || '',
      category: cred.category || 'Other'
    })
    setShowEditModal(true)
  }

  const handleUpdateCred = async (e) => {
    e.preventDefault()
    if (!editingCred || !newCred.service) return
    
    try {
      setError('')
      await credentialAPI.update(editingCred.id, newCred)
      
      // Refresh the list
      await fetchCredentials()
      
      setShowEditModal(false)
      setEditingCred(null)
      setNewCred({
        service: '',
        username: '',
        password: '',
        category: 'Other'
      })
    } catch (err) {
      setError(err.message || 'Failed to update credential')
      console.error('Update error:', err)
    }
  }

  const handleDeleteCred = async (id) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) return
    
    try {
      setError('')
      await credentialAPI.delete(id)
      
      // Refresh the list
      await fetchCredentials()
    } catch (err) {
      setError(err.message || 'Failed to delete credential')
      console.error('Delete error:', err)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const categoryColors = {
    'Development': 'from-blue-500 to-cyan-500',
    'Entertainment': 'from-purple-500 to-pink-500',
    'Cloud': 'from-orange-500 to-red-500',
    'Social': 'from-indigo-500 to-blue-500',
    'Finance': 'from-green-500 to-emerald-500',
  }

  if (loading && credentials.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading credentials...</div>
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
              <span className="text-6xl">🔐</span>
              Credential Manager
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Secure credential storage
            </p>
          </div>
          <div className="flex gap-3">
            <UploadButton
              onUpload={handleUpload}
              acceptedTypes={['.xlsx', '.xls', '.csv']}
              title="Upload Credentials Data"
              buttonText="Upload"
              gradient="from-indigo-500 to-blue-500"
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-indigo-500/50 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add New Credential</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {credentials.map((cred, index) => (
          <motion.div
            key={cred.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card group hover:scale-105 transition-transform duration-300 relative"
          >
            {/* Edit and Delete Icons */}
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <button
                onClick={() => handleEditCred(cred)}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteCred(cred.id)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-110"
                title="Delete"
              >
                🗑️
              </button>
            </div>
            <div className={`w-full h-20 rounded-xl bg-gradient-to-br ${categoryColors[cred.category] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-lg mb-4`}>
              🔒
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">
              {cred.service}
            </h3>
            <div className="mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium glass-strong">
                {cred.category}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Username</label>
                <div className="glass-strong px-4 py-2 rounded-lg font-mono text-sm text-slate-700 dark:text-slate-300">
                  {cred.username}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Password</label>
                <div className="flex items-center gap-2">
                  <div className="glass-strong px-4 py-2 rounded-lg font-mono text-sm text-slate-700 dark:text-slate-300 flex-1">
                    {showPassword[cred.id] ? cred.password : '••••••••••••'}
                  </div>
                  <button
                    onClick={() => togglePassword(cred.id)}
                    className="glass-strong px-3 py-2 rounded-lg hover:scale-105 transition-transform duration-300"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword[cred.id] ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => handleCopy(cred.username)}
                className="flex-1 glass-strong px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-transform duration-300"
              >
                Copy Username
              </button>
              <button 
                onClick={() => handleCopy(cred.password)}
                className="flex-1 glass-strong px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-transform duration-300"
              >
                Copy Password
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Credential Modal */}
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
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Add Credential</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Fill the details and save.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCred} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                name="service"
                value={newCred.service}
                onChange={(e) => setNewCred({ ...newCred, service: e.target.value })}
                placeholder="Service name*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <select
                value={newCred.category}
                onChange={(e) => setNewCred({ ...newCred, category: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {Object.keys(categoryColors).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              <input
                required
                name="username"
                value={newCred.username}
                onChange={(e) => setNewCred({ ...newCred, username: e.target.value })}
                placeholder="Username/Email*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                required
                name="password"
                type="password"
                value={newCred.password}
                onChange={(e) => setNewCred({ ...newCred, password: e.target.value })}
                placeholder="Password*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 glow-on-hover"
                >
                  Add
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Credential Modal */}
      {showEditModal && editingCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setEditingCred(null) }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass-card w-full max-w-2xl p-6 z-10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Edit Credential</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Update the details and save.</p>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingCred(null) }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCred} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                name="service"
                value={newCred.service}
                onChange={(e) => setNewCred({ ...newCred, service: e.target.value })}
                placeholder="Service name*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <select
                value={newCred.category}
                onChange={(e) => setNewCred({ ...newCred, category: e.target.value })}
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {Object.keys(categoryColors).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              <input
                required
                name="username"
                value={newCred.username}
                onChange={(e) => setNewCred({ ...newCred, username: e.target.value })}
                placeholder="Username/Email*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                required
                name="password"
                type="password"
                value={newCred.password}
                onChange={(e) => setNewCred({ ...newCred, password: e.target.value })}
                placeholder="Password*"
                className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingCred(null) }}
                  className="px-4 py-2 rounded-lg bg-white/20 dark:bg-black/20 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 glow-on-hover"
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

export default CredentialManager

