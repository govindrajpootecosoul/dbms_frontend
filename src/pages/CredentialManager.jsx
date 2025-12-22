import { motion } from 'framer-motion'
import { useState } from 'react'
import UploadButton from '../components/UploadButton'

const CredentialManager = () => {
  const [credentials, setCredentials] = useState([
    { id: 1, service: 'GitHub', username: 'user@example.com', password: '••••••••••••', category: 'Development' },
    { id: 2, service: 'Netflix', username: 'user@netflix.com', password: '••••••••••••', category: 'Entertainment' },
    { id: 3, service: 'AWS Console', username: 'admin@company.com', password: '••••••••••••', category: 'Cloud' },
    { id: 4, service: 'Discord', username: 'username#1234', password: '••••••••••••', category: 'Social' },
  ])

  const [showPassword, setShowPassword] = useState({})

  const togglePassword = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleUpload = (data) => {
    const newCredentials = data.map((item, index) => ({
      id: credentials.length + index + 1,
      service: item.service || item['Service'] || item.name || `Service ${index + 1}`,
      username: item.username || item['Username'] || item.email || item['Email'] || '',
      password: '••••••••••••', // Always masked in UI
      category: item.category || item['Category'] || item.type || 'Other'
    }))
    setCredentials([...credentials, ...newCredentials])
  }

  const categoryColors = {
    'Development': 'from-blue-500 to-cyan-500',
    'Entertainment': 'from-purple-500 to-pink-500',
    'Cloud': 'from-orange-500 to-red-500',
    'Social': 'from-indigo-500 to-blue-500',
    'Finance': 'from-green-500 to-emerald-500',
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 relative"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-base font-bold mb-4 text-gradient flex items-center gap-4">
              <span className="text-6xl">🔐</span>
              Credential Manager
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Secure credential storage (UI-only, masked values)
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
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-indigo-500/50 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add New Credential</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card mb-4 border-yellow-500/50 bg-yellow-500/10"
      >
        <div className="flex items-start gap-4">
          <span className="text-base">⚠️</span>
          <div>
            <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">
              UI-Only Implementation
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              This is a visual demonstration only. All passwords are masked and no actual credentials are stored or transmitted.
            </p>
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
            className="glass-card group hover:scale-105 transition-transform duration-300"
          >
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
                    {showPassword[cred.id] ? '••••••••••••' : cred.password}
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
              <button className="flex-1 glass-strong px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-transform duration-300">
                Copy
              </button>
              <button className="flex-1 glass-strong px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-transform duration-300">
                Edit
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default CredentialManager

