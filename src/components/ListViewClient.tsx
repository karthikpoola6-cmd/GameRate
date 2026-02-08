'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getCoverUrl } from '@/lib/igdb'
import { AddGameToList } from './AddGameToList'
import { ScrollReveal } from './ScrollReveal'

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
  initialIsRanked: boolean
  initialName: string
  initialDescription: string | null
  ownerUsername: string
  isPublic: boolean
  isOwnerFromServer: boolean
}

export function ListViewClient({
  listId,
  items: initialItems,
  initialIsRanked,
  initialName,
  initialDescription,
  ownerUsername,
  isPublic,
  isOwnerFromServer
}: ListViewClientProps) {
  const [items, setItems] = useState(initialItems)
  const [saving, setSaving] = useState(false)
  const [isRanked, setIsRanked] = useState(initialIsRanked)
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [listName, setListName] = useState(initialName)
  const [listDescription, setListDescription] = useState(initialDescription || '')
  const supabase = createClient()

  // Trust the server-side ownership check
  const isOwner = isOwnerFromServer

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

  function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    if (toIndex < 0 || toIndex >= items.length) return

    const newItems = [...items]
    const [movedItem] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, movedItem)
    setItems(newItems)
    setHasChanges(true)
  }

  async function saveChanges() {
    setSaving(true)
    // Update list name/description
    await supabase
      .from('lists')
      .update({ name: listName, description: listDescription || null })
      .eq('id', listId)

    // Batch update all positions
    const updates = items.map((item, index) =>
      supabase
        .from('list_items')
        .update({ position: index })
        .eq('id', item.id)
    )
    await Promise.all(updates)
    setHasChanges(false)
    setSaving(false)
  }

  function handleMoveUp(index: number) {
    if (index > 0) {
      handleReorder(index, index - 1)
    }
  }

  function handleMoveDown(index: number) {
    if (index < items.length - 1) {
      handleReorder(index, index + 1)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 mt-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isOwner && isEditing ? (
              <input
                type="text"
                value={listName}
                onChange={(e) => {
                  setListName(e.target.value)
                  setHasChanges(true)
                }}
                className="text-2xl font-bold bg-background-secondary border border-purple/30 rounded-lg px-3 py-1 w-full focus:outline-none focus:border-purple"
                placeholder="List name"
              />
            ) : (
              <h1 className="text-2xl font-bold">{listName}</h1>
            )}
            {isOwner && isEditing ? (
              <input
                type="text"
                value={listDescription}
                onChange={(e) => {
                  setListDescription(e.target.value)
                  setHasChanges(true)
                }}
                className="text-foreground-muted mt-2 bg-background-secondary border border-purple/30 rounded-lg px-3 py-1 w-full text-sm focus:outline-none focus:border-purple"
                placeholder="Description (optional)"
              />
            ) : (
              listDescription && (
                <p className="text-foreground-muted mt-1 text-sm">{listDescription}</p>
              )
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isRanked && !isEditing && (
              <span className="px-2 py-1 bg-gold/20 text-gold text-xs rounded">
                Ranked
              </span>
            )}
            {!isPublic && !isEditing && (
              <span className="px-2 py-1 bg-purple/20 text-purple text-xs rounded">
                Private
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 text-sm text-foreground-muted">
          <Link href={`/user/${ownerUsername}`}>
            by @{ownerUsername}
          </Link>
          <span>{items.length} games</span>
        </div>
      </div>

      {/* Controls row */}
      {isOwner && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {saving && <span className="text-sm text-foreground-muted">Saving...</span>}
            {!saving && hasChanges && isEditing && (
              <span className="text-sm text-purple">Unsaved</span>
            )}
            {/* Edit toggle button */}
            {!saving && (
              <button
                onPointerDown={async () => {
                  if (isEditing && hasChanges) {
                    await saveChanges()
                  }
                  setIsEditing(!isEditing)
                }}
                className={`text-sm px-3 py-1.5 rounded-full font-medium select-none ${
                  isEditing
                    ? 'bg-purple text-white'
                    : 'text-foreground-muted'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {isEditing ? 'Done' : 'Edit'}
              </button>
            )}
            {/* Ranked toggle - only show in edit mode */}
            {isEditing && (
              <button
                onPointerDown={handleToggleRanked}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium select-none ${
                  isRanked
                    ? 'bg-purple text-white'
                    : 'bg-background-secondary text-foreground-muted'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Ranked
              </button>
            )}
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
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {items.map((item, index) => (
            <ScrollReveal key={item.id} distance={20}>
            <div
              className="group relative flex items-center gap-3 p-3 glass border border-purple/10 rounded-lg"
            >
              {/* Remove button - only visible in edit mode */}
              {isOwner && isEditing && (
                <button
                  onPointerDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleRemoveItem(item.id)
                  }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg z-10 select-none active:scale-90 active:bg-red-600"
                  style={{ touchAction: 'manipulation' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Arrow buttons - only visible in edit mode */}
              {isOwner && isEditing && (
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onPointerDown={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className={`w-11 h-11 flex items-center justify-center rounded-lg select-none ${
                      index === 0
                        ? 'bg-background-secondary/50 text-foreground-muted/20'
                        : 'bg-purple/20 text-purple active:bg-purple active:text-white active:scale-95'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onPointerDown={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className={`w-11 h-11 flex items-center justify-center rounded-lg select-none ${
                      index === items.length - 1
                        ? 'bg-background-secondary/50 text-foreground-muted/20'
                        : 'bg-purple/20 text-purple active:bg-purple active:text-white active:scale-95'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="relative flex-shrink-0">
                <Link
                  href={`/game/${item.game_slug}`}
                  onClick={(e) => isEditing && e.preventDefault()}
                  className={`block w-12 h-16 bg-background-secondary rounded overflow-hidden ${isEditing ? 'pointer-events-none' : ''}`}
                >
                  {item.game_cover_id ? (
                    <Image
                      src={getCoverUrl(item.game_cover_id, 'cover_small')}
                      alt={item.game_name}
                      width={48}
                      height={64}
                      className="w-full h-full object-cover"
                      draggable={false}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🎮
                    </div>
                  )}
                </Link>
                {/* Position badge - only show when ranked and NOT editing */}
                {isRanked && !isEditing && (
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-purple text-white rounded-full flex items-center justify-center text-xs font-bold shadow z-10">
                    {index + 1}
                  </div>
                )}
              </div>

              <Link
                href={`/game/${item.game_slug}`}
                onClick={(e) => isEditing && e.preventDefault()}
                className={`flex-1 min-w-0 ${isEditing ? 'pointer-events-none' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">
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
            </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
