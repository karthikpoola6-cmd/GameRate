'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getCoverUrl } from '@/lib/igdb'

interface ListItem {
  id: string
  game_id: number
  game_slug: string
  game_name: string
  game_cover_id: string | null
  position: number
  notes: string | null
}

interface ListItemsProps {
  listId: string
  items: ListItem[]
  isOwner: boolean
  onItemsChange?: (items: ListItem[]) => void
}

export function ListItems({ listId, items: initialItems, isOwner, onItemsChange }: ListItemsProps) {
  const [items, setItems] = useState(initialItems)

  // Expose addItem function for external use
  const addItem = (newItem: ListItem) => {
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    onItemsChange?.(updatedItems)
  }

  // Expose this via a ref or keep it internal and use props
  // For simplicity, we'll handle this via the parent component
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function handleRemoveItem(itemId: string) {
    // Optimistically update UI
    setItems(items.filter(item => item.id !== itemId))

    // Delete from database
    await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId)
  }

  async function handleDragEnd(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return

    const newItems = [...items]
    const [movedItem] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, movedItem)

    // Update local state immediately
    setItems(newItems)

    // Save new positions to database
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

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-foreground-muted">
        This list is empty
      </div>
    )
  }

  return (
    <div>
      {isOwner && (
        <p className="text-sm text-foreground-muted mb-4">
          {saving ? 'Saving...' : 'Drag to reorder'}
        </p>
      )}
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
            <span className="w-6 text-center text-foreground-muted font-mono text-sm">
              {index + 1}
            </span>

            <Link
              href={`/game/${item.game_slug}`}
              className="w-12 h-16 bg-background-secondary rounded overflow-hidden flex-shrink-0"
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

            <Link
              href={`/game/${item.game_slug}`}
              className="flex-1 min-w-0"
              onClick={(e) => draggedIndex !== null && e.preventDefault()}
            >
              <h3 className="font-medium truncate hover:text-purple transition-colors">
                {item.game_name}
              </h3>
              {item.notes && (
                <p className="text-sm text-foreground-muted truncate mt-0.5">
                  {item.notes}
                </p>
              )}
            </Link>

            {/* Remove button */}
            {isOwner && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleRemoveItem(item.id)
                }}
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
    </div>
  )
}
