import { motion } from 'framer-motion'
import { useState } from 'react'
import UploadButton from '../components/UploadButton'

const GamesLibrary = () => {
  const [games, setGames] = useState([
    { id: 1, title: 'The Legend of Zelda: Tears of the Kingdom', platform: 'Nintendo Switch', status: 'Completed', rating: 10, image: '🗡️' },
    { id: 2, title: 'Baldur\'s Gate 3', platform: 'PC', status: 'Playing', rating: 10, image: '🎲' },
    { id: 3, title: 'Elden Ring', platform: 'PlayStation 5', status: 'Completed', rating: 9, image: '⚔️' },
    { id: 4, title: 'Cyberpunk 2077', platform: 'PC', status: 'Playing', rating: 8, image: '🤖' },
  ])

  const handleUpload = (data) => {
    const newGames = data.map((item, index) => ({
      id: games.length + index + 1,
      title: item.title || item.name || item['Title'] || `Game ${index + 1}`,
      platform: item.platform || item['Platform'] || 'PC',
      status: item.status || item['Status'] || 'Plan to Play',
      rating: parseInt(item.rating || item['Rating'] || item.score || 0),
      image: item.image || item['Image'] || '🎮'
    }))
    setGames([...games, ...newGames])
  }

  const statusColors = {
    'Playing': 'bg-green-500/20 text-green-300 border-green-500/50',
    'Completed': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    'On Hold': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    'Plan to Play': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  }

  const platformColors = {
    'PC': 'from-blue-500 to-cyan-500',
    'PlayStation 5': 'from-blue-600 to-indigo-600',
    'Nintendo Switch': 'from-red-500 to-pink-500',
    'Xbox': 'from-green-500 to-emerald-500',
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
              <span className="text-6xl">🎮</span>
              Games Library
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Your gaming collection and progress
            </p>
          </div>
          <div className="flex gap-3">
            <UploadButton
              onUpload={handleUpload}
              acceptedTypes={['.xlsx', '.xls', '.csv']}
              title="Upload Games Data"
              buttonText="Upload"
              gradient="from-green-500 to-emerald-500"
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add New Game</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
        {['All', 'Playing', 'Completed', 'On Hold', 'Plan to Play'].map((filter, index) => (
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
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card group hover:scale-105 transition-transform duration-300"
          >
            <div className={`w-full h-32 rounded-xl bg-gradient-to-br ${platformColors[game.platform] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-6xl mb-4`}>
              {game.image}
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200 line-clamp-2">
              {game.title}
            </h3>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[game.status]}`}>
                {game.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium glass-strong">
                {game.platform}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Rating:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < game.rating / 2 ? 'text-yellow-400' : 'text-slate-400'}>
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm font-semibold">{game.rating}/10</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default GamesLibrary

