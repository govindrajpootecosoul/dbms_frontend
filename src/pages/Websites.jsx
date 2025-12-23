import { useState } from 'react'
import { motion } from 'framer-motion'

const Websites = () => {
  const [websites, setWebsites] = useState([
    {
      id: 1,
      name: 'MDN Web Docs',
      category: 'Documentation',
      description: 'Authoritative documentation for web standards, HTML, CSS, JS.',
      link: 'https://developer.mozilla.org/',
    },
    {
      id: 2,
      name: 'Stack Overflow',
      category: 'Q&A',
      description: 'Developer questions and answers, code snippets, and tips.',
      link: 'https://stackoverflow.com/',
    },
    {
      id: 3,
      name: 'GitHub',
      category: 'Code Hosting',
      description: 'Repository hosting, issues, pull requests, and collaboration.',
      link: 'https://github.com/',
    },
  ].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase()
    const nameB = (b.name || '').toLowerCase()
    return nameA.localeCompare(nameB)
  }))

  const [search, setSearch] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingWebsite, setEditingWebsite] = useState(null)
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    link: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.link) return
    
    if (editingWebsite) {
      // Update existing website
      setWebsites((prev) => {
        const updated = prev.map(site => 
          site.id === editingWebsite.id 
            ? { ...site, ...form, category: form.category || 'General' }
            : site
        )
        // Sort alphabetically by name
        return updated.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase()
          const nameB = (b.name || '').toLowerCase()
          return nameA.localeCompare(nameB)
        })
      })
      setShowEditModal(false)
      setEditingWebsite(null)
    } else {
      // Add new website
      setWebsites((prev) => {
        const newWebsites = [
          ...prev,
          {
            id: prev.length > 0 ? Math.max(...prev.map(s => s.id)) + 1 : 1,
            name: form.name,
            category: form.category || 'General',
            description: form.description || '',
            link: form.link,
          },
        ]
        // Sort alphabetically by name
        return newWebsites.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase()
          const nameB = (b.name || '').toLowerCase()
          return nameA.localeCompare(nameB)
        })
      })
    }
    setForm({ name: '', category: '', description: '', link: '' })
  }

  const handleEditWebsite = (website) => {
    setEditingWebsite(website)
    setForm({
      name: website.name,
      category: website.category || '',
      description: website.description || '',
      link: website.link,
    })
    setShowEditModal(true)
  }

  const handleDeleteWebsite = (id) => {
    if (window.confirm('Are you sure you want to delete this website?')) {
      setWebsites((prev) => prev.filter(site => site.id !== id))
    }
  }

  // Filter websites based on search
  const filteredWebsites = websites.filter((site) => {
    const matchesSearch = search === '' || 
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      (site.description && site.description.toLowerCase().includes(search.toLowerCase())) ||
      (site.category && site.category.toLowerCase().includes(search.toLowerCase()))
    
    return matchesSearch
  })

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
            <span className="text-4xl">🌐</span>
            Websites
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Store website name, category, description, and link.
          </p>
        </div>
      </motion.div>

      {/* Add Website Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Website Name*</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="e.g. MDN Web Docs"
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Documentation, Tools, Learning"
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            placeholder="Short note about why this site is useful"
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Link*</label>
          <input
            name="link"
            type="url"
            value={form.link}
            onChange={handleChange}
            required
            placeholder="https://example.com"
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all duration-300 glow-on-hover"
          >
            Add Website
          </button>
        </div>
      </motion.form>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, or description..."
              className="w-full px-4 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>
      </motion.div>

      {/* Websites Grid */}
      {filteredWebsites.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredWebsites.map((site, idx) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-4 flex flex-col gap-3 relative group"
          >
            {/* Edit and Delete Icons */}
            <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => handleEditWebsite(site)}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteWebsite(site.id)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-all duration-300 hover:scale-110"
                title="Delete"
              >
                🗑️
              </button>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{site.name}</h3>
                {site.category && (
                  <span className="inline-flex mt-1 px-2 py-1 text-xs rounded-full bg-teal-500/15 text-teal-500 border border-teal-500/30">
                    {site.category}
                  </span>
                )}
              </div>
            </div>

            {site.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {site.description}
              </p>
            )}

            <div className="mt-auto">
              <a
                href={site.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 font-semibold"
              >
                <span>🔗</span>
                <span>Open Link</span>
              </a>
            </div>
          </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card text-center py-12"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">
            No websites found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {search 
              ? `No websites match "${search}"`
              : 'No websites found'
            }
          </p>
        </motion.div>
      )}

      {/* Edit Website Modal */}
      {showEditModal && editingWebsite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => {
            setShowEditModal(false)
            setEditingWebsite(null)
            setForm({ name: '', category: '', description: '', link: '' })
          }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative glass-card w-full max-w-2xl p-6 z-10"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Edit Website</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Update the website details.</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingWebsite(null)
                  setForm({ name: '', category: '', description: '', link: '' })
                }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Website Name*</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. MDN Web Docs"
                  className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Documentation, Tools, Learning"
                  className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Short note about why this site is useful"
                  className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Link*</label>
                <input
                  name="link"
                  type="url"
                  value={form.link}
                  onChange={handleChange}
                  required
                  placeholder="https://example.com"
                  className="px-3 py-2 rounded-lg bg-white/70 dark:bg-black/20 border border-white/30 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingWebsite(null)
                    setForm({ name: '', category: '', description: '', link: '' })
                  }}
                  className="px-4 py-2 rounded-lg bg-white/20 dark:bg-black/20 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all duration-300 glow-on-hover"
                >
                  Update Website
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Websites


