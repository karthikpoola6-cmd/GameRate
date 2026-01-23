'use client'

import { useState } from 'react'
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
  isOwner: boolean
  initialIsRanked: boolean
}

export function ListViewClient({ listId, items: initialItems, isOwner, initialIsRanked }: ListViewClientProps) {
  const [items, setItems] = useState(initialItems)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [isRanked, setIsRanked] = useState(initialIsRanked)
  const supabase = createClient()

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

  async function handleDragEnd(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return

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

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function handleDragLeave() {
    setDragOverIndex(null)
  }

  function handleDrop(e: React.DragEvent, toIndex: number) {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      handleDragEnd(draggedIndex, toIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div>
      {/* Header row with controls */}
      {isOwner && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-foreground-muted">
              {saving ? 'Saving...' : items.length > 0 ? 'Drag to reorder' : ''}
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
              className={`group relative flex items-center gap-4 p-3 bg-background-card border border-purple/10 rounded-lg transition-all ${
                isOwner ? 'cursor-grab active:cursor-grabbing' : ''
              } ${draggedIndex === index ? 'opacity-50' : ''} ${
                dragOverIndex === index ? 'border-purple ring-2 ring-purple/20' : 'hover:border-purple/30'
              }`}
              draggable={isOwner}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="relative flex-shrink-0">
                <Link
                  href={`/game/${item.game_slug}`}
                  className="block w-12 h-16 bg-background-secondary rounded overflow-hidden"
                  onClick={(e) => draggedIndex !== null && e.preventDefault()}
                >
                  {item.game_cover_id ? (
                    <Image
                      src={getCoverUrl(item.game_cover_id, 'cover_small')}
                      alt={item.game_name}
                      width={48}
                      height={64}
                      className="w-full h-full object-cover"
                      draggable={false}
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
                onClick={(e) => draggedIndex !== null && e.preventDefault()}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate hover:text-purple transition-colors">
                    {item.game_name}
                  </h3>
                  {/* Star rating */}
                  {item.rating && (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.rating! ? 'text-gold fill-gold' : 'text-foreground-muted/30'
                          }`}
                          viewBox="0 0 24 24"
                          fill={i < item.rating! ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
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
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="w-8 h-8 bg-black/60 hover:bg-red-500 text-white/80 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove from list"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
