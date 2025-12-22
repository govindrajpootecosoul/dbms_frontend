import { motion } from 'framer-motion'

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl md:text-7xl font-bold mb-4 text-gradient">
          Personal Knowledge & Entertainment Portal
        </h1>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300">
          Organize and visualize your digital life
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: '🎌', title: 'Anime Tracker', desc: 'Track your favorite anime series', color: 'from-pink-500 to-rose-500' },
          { icon: '🎬', title: 'Movies & Series', desc: 'Your personal cinema collection', color: 'from-blue-500 to-cyan-500' },
          { icon: '🇰🇷', title: 'K-Drama', desc: 'Korean drama watchlist', color: 'from-purple-500 to-pink-500' },
          { icon: '⚔️', title: 'Genshin Impact', desc: 'Character builds and progress', color: 'from-amber-500 to-orange-500' },
          { icon: '🎮', title: 'Games Library', desc: 'Your gaming collection', color: 'from-green-500 to-emerald-500' },
          { icon: '🔐', title: 'Credentials', desc: 'Secure credential manager', color: 'from-indigo-500 to-blue-500' },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="glass-card group cursor-pointer hover:scale-105 transition-transform duration-300"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-base mb-4 group-hover:scale-110 transition-transform duration-300`}>
              {item.icon}
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-200">
              {item.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <p className="text-slate-500 dark:text-slate-400">
          Click the circular menu at the bottom to navigate
        </p>
      </motion.div>
    </div>
  )
}

export default Home

