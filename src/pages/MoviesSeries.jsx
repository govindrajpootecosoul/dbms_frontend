import { motion } from 'framer-motion'
import { useState } from 'react'
import UploadButton from '../components/UploadButton'

const MoviesSeries = () => {
  const [content, setContent] = useState([
    { id: 1, title: 'Inception', type: 'Movie', year: 2010, rating: 9, status: 'Watched', image: '🎬' },
    { id: 2, title: 'Stranger Things', type: 'Series', year: 2016, rating: 9, status: 'Watching', image: '👽' },
    { id: 3, title: 'The Dark Knight', type: 'Movie', year: 2008, rating: 10, status: 'Watched', image: '🦇' },
    { id: 4, title: 'Breaking Bad', type: 'Series', year: 2008, rating: 10, status: 'Completed', image: '🧪' },
  ])

  const handleUpload = (data) => {
    const newContent = data.map((item, index) => ({
      id: content.length + index + 1,
      title: item.title || item.name || item['Title'] || `Content ${index + 1}`,
      type: item.type || item['Type'] || item.category || 'Movie',
      year: parseInt(item.year || item['Year'] || 2024),
      rating: parseInt(item.rating || item['Rating'] || item.score || 0),
      status: item.status || item['Status'] || 'Plan to Watch',
      image: item.image || item['Image'] || '🎬'
    }))
    setContent([...content, ...newContent])
  }

  const statusColors = {
    'Watching': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    'Watched': 'bg-green-500/20 text-green-300 border-green-500/50',
    'Completed': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    'Plan to Watch': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
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
        {['All', 'Movies', 'Series', 'Watching', 'Watched'].map((filter, index) => (
          <motion.button
            key={filter}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-strong px-6 py-2 rounded-full whitespace-nowrap hover:scale-105 transition-transform duration-300"
          >
            {filter}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {content.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card group hover:scale-105 transition-transform duration-300"
          >
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
    </div>
  )
}

export default MoviesSeries

