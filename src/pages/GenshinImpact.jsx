import { motion } from 'framer-motion'
import { useState } from 'react'
import UploadButton from '../components/UploadButton'

const GenshinImpact = () => {
  const [characters, setCharacters] = useState([
    { id: 1, name: 'Raiden Shogun', element: 'Electro', rarity: 5, level: 90, constellation: 2, image: '⚡' },
    { id: 2, name: 'Zhongli', element: 'Geo', rarity: 5, level: 90, constellation: 0, image: '🛡️' },
    { id: 3, name: 'Hu Tao', element: 'Pyro', rarity: 5, level: 80, constellation: 1, image: '🔥' },
    { id: 4, name: 'Ganyu', element: 'Cryo', rarity: 5, level: 90, constellation: 0, image: '❄️' },
  ])

  const handleUpload = (data) => {
    const newCharacters = data.map((item, index) => ({
      id: characters.length + index + 1,
      name: item.name || item['Name'] || item.character || `Character ${index + 1}`,
      element: item.element || item['Element'] || 'Anemo',
      rarity: parseInt(item.rarity || item['Rarity'] || item.stars || 4),
      level: parseInt(item.level || item['Level'] || 1),
      constellation: parseInt(item.constellation || item['Constellation'] || item['C'] || 0),
      image: item.image || item['Image'] || '⚔️'
    }))
    setCharacters([...characters, ...newCharacters])
  }

  const elementColors = {
    'Electro': 'from-purple-500 to-pink-500',
    'Geo': 'from-amber-500 to-yellow-500',
    'Pyro': 'from-red-500 to-orange-500',
    'Cryo': 'from-cyan-500 to-blue-500',
    'Hydro': 'from-blue-500 to-cyan-500',
    'Anemo': 'from-green-500 to-emerald-500',
    'Dendro': 'from-green-600 to-lime-500',
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
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-amber-500/50 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add Character</span>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-strong px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
            >
              View Builds
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Total Characters', value: '45', icon: '👥' },
          { label: '5★ Characters', value: '12', icon: '⭐' },
          { label: 'Max Level', value: '8', icon: '⬆️' },
          { label: 'Adventure Rank', value: '58', icon: '🎯' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card text-center"
          >
            <div className="text-lg mb-2">{stat.icon}</div>
            <div className="text-base font-bold mb-1 text-gradient">{stat.value}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Characters Grid */}
      <div className="mb-3">
        <h2 className="text-base font-bold mb-4 text-slate-800 dark:text-slate-200">My Characters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {characters.map((char, index) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card group hover:scale-105 transition-transform duration-300"
            >
              <div className={`w-full h-32 rounded-xl bg-gradient-to-br ${elementColors[char.element]} flex items-center justify-center text-6xl mb-4`}>
                {char.image}
              </div>
              <h3 className="text-base font-bold mb-2 text-slate-800 dark:text-slate-200">
                {char.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Element:</span>
                  <span className="font-semibold">{char.element}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Level:</span>
                  <span className="font-semibold">{char.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Constellation:</span>
                  <span className="font-semibold">C{char.constellation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Rarity:</span>
                  <div className="flex gap-1">
                    {[...Array(char.rarity)].map((_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GenshinImpact

