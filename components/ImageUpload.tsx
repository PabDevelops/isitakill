'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']

interface Props {
  label: string
  hint?: string
  value: string
  onChange: (url: string) => void
  aspect?: string
}

export default function ImageUpload({ label, hint, value, onChange, aspect }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      setError('PNG, JPG, or WebP only')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Max 5MB')
      return
    }
    setError('')
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(path, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('project-images').getPublicUrl(path)
    onChange(data.publicUrl)
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-2">{label}</label>
      {hint && <p className="text-zinc-500 text-xs mb-2">{hint}</p>}

      {value ? (
        <div className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className={`w-full ${aspect ?? 'aspect-square'} object-cover rounded-xl border border-white/[0.08]`}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-1 border border-dashed rounded-xl py-8 px-4 cursor-pointer transition-colors text-center ${
            dragOver
              ? 'border-yellow-400/60 bg-yellow-400/5'
              : 'border-white/[0.12] hover:border-white/[0.25]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) upload(file)
            }}
          />
          {uploading ? (
            <p className="text-sm text-zinc-400">Uploading...</p>
          ) : (
            <>
              <span className="text-2xl mb-1">📤</span>
              <p className="text-sm font-medium text-zinc-300">Drop image here or click to upload</p>
              <p className="text-xs text-zinc-600">PNG, JPG, WebP up to 5MB</p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}
