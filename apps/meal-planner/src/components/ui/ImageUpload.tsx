import { useRef, useState } from 'react'
import { uploadImage } from '../../api/recipes'
import { imageUrl } from '../../utils/formatters'
import Spinner from './Spinner'

interface ImageUploadProps {
  value?: string
  onChange: (filename: string) => void
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setLoading(true)
    setError('')
    try {
      const filename = await uploadImage(file)
      onChange(filename)
    } catch {
      setError('Upload failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group">
          <img
            src={imageUrl(value)}
            alt="Recipe"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
        >
          {loading ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              <p className="text-3xl mb-2">📷</p>
              <p className="text-sm text-gray-500">
                Drag & drop an image here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 10MB</p>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
