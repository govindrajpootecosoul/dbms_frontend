import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

const FileUpload = ({ isOpen, onClose, onUpload, acceptedTypes = ['.xlsx', '.xls', '.csv'], title = 'Upload Data' }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFile = (uploadedFile) => {
    setError(null)
    setFile(uploadedFile)
    
    const fileExtension = uploadedFile.name.split('.').pop().toLowerCase()
    
    if (fileExtension === 'csv') {
      parseCSV(uploadedFile)
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      parseExcel(uploadedFile)
    } else {
      setError('Unsupported file type. Please upload .xlsx, .xls, or .csv files.')
    }
  }

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing CSV: ' + results.errors[0].message)
          return
        }
        setPreview({
          data: results.data.slice(0, 5), // Show first 5 rows
          totalRows: results.data.length,
          headers: Object.keys(results.data[0] || {})
        })
      },
      error: (error) => {
        setError('Error reading CSV file: ' + error.message)
      }
    })
  }

  const parseExcel = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
        
        if (jsonData.length === 0) {
          setError('The Excel file appears to be empty.')
          return
        }
        
        setPreview({
          data: jsonData.slice(0, 5), // Show first 5 rows
          totalRows: jsonData.length,
          headers: Object.keys(jsonData[0] || {}),
          sheetName: firstSheetName
        })
      } catch (error) {
        setError('Error parsing Excel file: ' + error.message)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleImport = () => {
    if (file && preview) {
      // Re-parse the full file for import
      const fileExtension = file.name.split('.').pop().toLowerCase()
      
      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            onUpload(results.data)
            handleClose()
          }
        })
      } else {
        const reader = new FileReader()
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
          onUpload(jsonData)
          handleClose()
        }
        reader.readAsArrayBuffer(file)
      }
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    setIsDragging(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-strong rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gradient">{title}</h2>
            <button
              onClick={handleClose}
              className="glass-strong rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform duration-300"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
              ${isDragging 
                ? 'border-blue-400 bg-blue-500/10 scale-105' 
                : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <div className="text-6xl">📁</div>
              <div>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {file ? file.name : 'Drag & drop your file here'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  or click to browse
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  Supported formats: {acceptedTypes.join(', ')}
                </p>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 glass-card border-red-500/50 bg-red-500/10 p-4 rounded-xl"
            >
              <p className="text-red-400 font-medium">⚠️ {error}</p>
            </motion.div>
          )}

          {/* Preview */}
          {preview && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="glass-card p-4 mb-4">
                <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  File Preview ({preview.totalRows} total rows)
                </h3>
                {preview.sheetName && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    Sheet: {preview.sheetName}
                  </p>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-300 dark:border-slate-600">
                        {preview.headers.map((header, idx) => (
                          <th key={idx} className="text-left p-2 font-semibold text-slate-700 dark:text-slate-300">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.data.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-slate-200 dark:border-slate-700">
                          {preview.headers.map((header, colIdx) => (
                            <td key={colIdx} className="p-2 text-slate-600 dark:text-slate-400">
                              {row[header] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.totalRows > 5 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Showing first 5 rows of {preview.totalRows} rows
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-6 justify-end">
            <button
              onClick={handleClose}
              className="glass-strong px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
            >
              Cancel
            </button>
            {preview && !error && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleImport}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-blue-500/50"
              >
                Import Data
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default FileUpload

