import { motion } from 'framer-motion'
import { useState } from 'react'
import FileUpload from './FileUpload'

const UploadButton = ({ onUpload, acceptedTypes, title, buttonText = 'Upload', gradient = 'from-blue-500 to-cyan-500' }) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const handleUpload = (data) => {
    onUpload(data)
  }

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsUploadOpen(true)}
        className={`bg-gradient-to-r ${gradient} text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center gap-2 text-sm`}
      >
        <span>📤</span>
        <span>{buttonText}</span>
      </motion.button>

      <FileUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        acceptedTypes={acceptedTypes}
        title={title}
      />
    </>
  )
}

export default UploadButton

