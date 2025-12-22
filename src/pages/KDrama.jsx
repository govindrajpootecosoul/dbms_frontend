import { motion } from 'framer-motion'
import { useState } from 'react'
import UploadButton from '../components/UploadButton'

const KDrama = () => {
  const [dramas, setDramas] = useState([
    { id: 1, title: 'Crash Landing on You', year: 2019, rating: 9, status: 'Completed', episodes: 16, image: '🇰🇷' },
    { id: 2, title: 'Squid Game', year: 2021, rating: 9, status: 'Completed', episodes: 9, image: '🦑' },
    { id: 3, title: 'Itaewon Class', year: 2020, rating: 8, status: 'Watching', episodes: 16, image: '🏪' },
    { id: 4, title: 'Vincenzo', year: 2021, rating: 9, status: 'Plan to Watch', episodes: 20, image: '☕' },
  ])

  const handleUpload = (data) => {
    const newDramas = data.map((item, index) => ({
      id: dramas.length + index + 1,
      title: item.title || item.name || item['Title'] || `K-Drama ${index + 1}`,
      year: parseInt(item.year || item['Year'] || 2024),
      rating: parseInt(item.rating || item['Rating'] || item.score || 0),
      status: item.status || item['Status'] || 'Plan to Watch',
      episodes: parseInt(item.episodes || item['Episodes'] || 0),
      image: item.image || item['Image'] || '🇰🇷'
    }))
    setDramas([...dramas, ...newDramas])
  }

  const statusColors = {
    'Watching': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    'Completed': 'bg-green-500/20 text-green-300 border-green-500/50',
    'Plan to Watch': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    'On Hold': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
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
            className="glass-card group hover:scale-105 transition-transform duration-300"
          >
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
    </div>
  )
}

export default KDrama

