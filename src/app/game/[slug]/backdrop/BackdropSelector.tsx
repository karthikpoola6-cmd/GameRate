'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getScreenshotUrl } from '@/lib/igdb'

interface BackdropSelectorProps {
  gameLogId: string
  gameSlug: string
  screenshots: string[]
  currentBackdropId: string | null
  defaultBackdropId: string | null
}

export function BackdropSelector({
  gameLogId,
  gameSlug,
  screenshots,
  currentBackdropId,
  defaultBackdropId,
}: BackdropSelectorProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(currentBackdropId)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)

    // If selecting the default (first screenshot), store null
    const newBackdropId = selectedId === defaultBackdropId ? null : selectedId

    await supabase
      .from('game_logs')
      .update({ custom_backdrop_id: newBackdropId })
      .eq('id', gameLogId)

    // Navigate back to game page, replacing history so back button skips this page
    router.replace(`/game/${gameSlug}`)
    router.refresh()
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-purple/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="text-foreground-muted hover:text-foreground"
          >
            Cancel
          </button>
          <h1 className="font-semibold">Choose Backdrop</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-purple font-medium disabled:opacity-50"
          >
            {saving ? '...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {screenshots.map((imageId, index) => {
            const isSelected = selectedId === imageId ||
              (selectedId === null && index === 0)

            return (
              <button
                key={imageId}
                onClick={() => setSelectedId(imageId)}
                className={`relative aspect-video rounded-lg overflow-hidden ${
                  isSelected ? 'ring-2 ring-purple' : 'ring-1 ring-white/10'
                }`}
              >
                <Image
                  src={getScreenshotUrl(imageId, 'screenshot_med')}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-purple/30 flex items-center justify-center">
                    <div className="w-8 h-8 bg-purple rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white">
                    Default
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {screenshots.length === 0 && (
          <p className="text-center text-foreground-muted py-8">
            No backdrops available for this game
          </p>
        )}
      </div>
    </>
  )
}
