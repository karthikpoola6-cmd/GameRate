'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getCoverUrl } from '@/lib/igdb'
import { AddGameToList } from './AddGameToList'

interface ListItem {
  id: string
  game_id: number
  game_slug: string
  game_name: string
  game_cover_id: string | null
  position: number
  notes: string | null
  rating?: number | null
}

interface ListViewClientProps {
  listId: string
  items: ListItem[]
  listOwnerId: string  // The user ID of the list owner
  initialIsRanked: boolean
}

export function ListViewClient({ listId, items: initialItems, listOwnerId, initialIsRanked }: ListViewClientProps) {
  const [items, setItems] = useState(initialItems)
  const [saving, setSaving] = useState(false)
  const [isRanked, setIsRanked] = useState(initialIsRanked)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  // Verify current user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null)
    })
  }, [supabase])

  // Only allow editing if current user is the list owner
  const isOwner = currentUserId === listOwnerId

  async function handleToggleRanked() {
    const newValue = !isRanked
    setIsRanked(newValue)
    await supabase
      .from('lists')
      .update({ is_ranked: newValue })
      .eq('id', listId)
  }

  function handleGameAdded(newItem: ListItem) {
    setItems([...items, newItem])
  }

  async function handleRemoveItem(itemId: string) {
    setItems(items.filter(item => item.id !== itemId))
    await supabase.from('list_items').delete().eq('id', itemId)
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    if (toIndex < 0 || toIndex >= items.length) return

    const newItems = [...items]
    const [movedItem] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, movedItem)
    setItems(newItems)

    setSaving(true)
    for (let i = 0; i < newItems.length; i++) {
      await supabase
        .from('list_items')
        .update({ position: i })
        .eq('id', newItems[i].id)
    }
    setSaving(false)
  }

  function handleMoveUp(index: number) {
    handleReorder(index, index - 1)
  }

  function handleMoveDown(index: number) {
    handleReorder(index, index + 1)
  }

  return (
    <div>
      {/* Header row with controls */}
      {isOwner && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-foreground-muted">
              {saving ? 'Saving...' : ''}
            </p>
            {/* Ranked toggle */}
            <button
              onClick={handleToggleRanked}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isRanked
                  ? 'bg-purple text-white'
                  : 'bg-background-secondary text-foreground-muted hover:text-foreground'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Ranked
            </button>
          </div>
          <AddGameToList
            listId={listId}
            onGameAdded={handleGameAdded}
            currentItemCount={items.length}
          />
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-foreground-muted">
          <p className="mb-4">This list is empty</p>
          {isOwner && (
            <p className="text-sm">Click &quot;Add Game&quot; to get started</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`group relative flex items-center gap-3 p-3 bg-background-card border border-purple/10 rounded-lg transition-all hover:border-purple/30`}
            >
              <div className="relative flex-shrink-0">
                <Link
                  href={`/game/${item.game_slug}`}
                  className="block w-12 h-16 bg-background-secondary rounded overflow-hidden"
                >
                  {item.game_cover_id ? (
                    <Image
                      src={getCoverUrl(item.game_cover_id, 'cover_small')}
                      alt={item.game_name}
                      width={48}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🎮
                    </div>
                  )}
                </Link>
                {/* Position badge - only show when ranked */}
                {isRanked && (
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-purple text-white rounded-full flex items-center justify-center text-xs font-bold shadow z-10">
                    {index + 1}
                  </div>
                )}
              </div>

              <Link
                href={`/game/${item.game_slug}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate hover:text-purple transition-colors">
                    {item.game_name}
                  </h3>
                  {/* Star rating */}
                  {item.rating && (
                    <div className="flex items-center flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((starNum) => {
                        const isFull = item.rating! >= starNum
                        const isHalf = !isFull && item.rating! >= starNum - 0.5
                        return (
                          <div key={starNum} className="relative w-3.5 h-3.5">
                            {/* Empty star background */}
                            <svg
                              className="absolute w-3.5 h-3.5 text-foreground-muted/30"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            {/* Half star */}
                            {isHalf && (
                              <svg
                                className="absolute w-3.5 h-3.5 text-gold"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                style={{ clipPath: 'inset(0 50% 0 0)' }}
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            )}
                            {/* Full star */}
                            {isFull && (
                              <svg
                                className="absolute w-3.5 h-3.5 text-gold"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                {item.notes && (
                  <p className="text-sm text-foreground-muted truncate mt-0.5">
                    {item.notes}
                  </p>
                )}
              </Link>

              {isOwner && (
                <div className="flex items-center gap-2">
                  {/* Reorder arrows */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || saving}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                      index === 0
                        ? 'text-foreground-muted/20 cursor-not-allowed'
                        : 'text-foreground-muted hover:text-purple hover:bg-purple/10 active:bg-purple/20'
                    }`}
                    title="Move up"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1 || saving}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                      index === items.length - 1
                        ? 'text-foreground-muted/20 cursor-not-allowed'
                        : 'text-foreground-muted hover:text-purple hover:bg-purple/10 active:bg-purple/20'
                    }`}
                    title="Move down"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={saving}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-muted/50 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-all"
                    title="Remove from list"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
