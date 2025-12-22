import { motion } from 'framer-motion'
import { useState } from 'react'
import UploadButton from '../components/UploadButton'

const AnimeTracker = () => {
  const [animeList, setAnimeList] = useState([
    { id: 1, title: 'Attack on Titan', status: 'Completed', rating: 10, episodes: 75, image: '🎌' },
    { id: 2, title: 'Demon Slayer', status: 'Watching', rating: 9, episodes: 44, image: '⚔️' },
    { id: 3, title: 'Jujutsu Kaisen', status: 'Watching', rating: 9, episodes: 24, image: '👹' },
    { id: 4, title: 'One Piece', status: 'On Hold', rating: 8, episodes: 1000, image: '🏴‍☠️' },
  ])

  const handleUpload = (data) => {
    // Map uploaded data to anime format
    const newAnime = data.map((item, index) => ({
      id: animeList.length + index + 1,
      title: item.title || item.name || item['Anime Title'] || `Anime ${index + 1}`,
      status: item.status || item['Status'] || 'Plan to Watch',
      rating: parseInt(item.rating || item['Rating'] || item.score || 0),
      episodes: parseInt(item.episodes || item['Episodes'] || 0),
      image: item.image || item['Image'] || '🎌'
    }))
    setAnimeList([...animeList, ...newAnime])
  }

  const statusColors = {
    'Watching': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    'Completed': 'bg-green-500/20 text-green-300 border-green-500/50',
    'On Hold': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    'Dropped': 'bg-red-500/20 text-red-300 border-red-500/50',
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
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-pink-500/50 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add New Anime</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {animeList.map((anime, index) => (
          <motion.div
            key={anime.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card group hover:scale-105 transition-transform duration-300"
          >
            <div className="text-6xl mb-4 text-center">{anime.image}</div>
            <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">
              {anime.title}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[anime.status]}`}>
                {anime.status}
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Episodes:</span>
                <span className="font-semibold">{anime.episodes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rating:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < anime.rating / 2 ? 'text-yellow-400' : 'text-slate-400'}>
                      ★
                    </span>
                  ))}
                  <span className="ml-2 font-semibold">{anime.rating}/10</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AnimeTracker

