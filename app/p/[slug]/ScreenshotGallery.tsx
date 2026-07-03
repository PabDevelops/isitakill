'use client'
import { useState, useEffect } from 'react'

export default function ScreenshotGallery({
  screenshotUrls,
  projectName,
}: {
  screenshotUrls: string
  projectName: string
}) {
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null)

  useEffect(() => {
    if (!activeScreenshot) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveScreenshot(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeScreenshot])

  const urls = screenshotUrls
    .split('\n')
    .map((url) => url.trim())
    .filter(Boolean)

  if (urls.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pl-1">
        Project Screenshots
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {urls.map((url, i) => (
          <div
            key={i}
            onClick={() => setActiveScreenshot(url)}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.01] cursor-pointer group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${projectName} screenshot ${i + 1}`}
              className="w-full object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs font-medium bg-black/75 px-3.5 py-2 rounded-full border border-white/10 text-zinc-300 flex items-center gap-1.5 shadow-lg">
                <span>🔍</span> Ampliar captura
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal */}
      {activeScreenshot && (
        <div
          onClick={() => setActiveScreenshot(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeScreenshot}
              alt="Screenshot preview"
              className="max-w-full max-h-[85vh] rounded-xl object-contain border border-white/10 select-none shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()} // Stop click inside the image from closing the modal
            />
            <button
              onClick={() => setActiveScreenshot(null)}
              className="absolute -top-12 sm:top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors cursor-pointer border border-white/10 focus:outline-none"
              title="Close (Esc)"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
