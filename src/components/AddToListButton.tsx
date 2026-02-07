'use client'

import { useState, useEffect, useRef } from 'react'
import type { List } from '@/lib/types'

interface GameInfo {
  id: number
  slug: string
  name: string
  cover_id?: string
}

interface AddToListButtonProps {
  game: GameInfo
}

export function AddToListButton({ game }: AddToListButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [lists, setLists] = useState<(List & { game_in_list?: boolean })[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [creating, setCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch user's lists
  useEffect(() => {
    if (!isOpen) return

    async function fetchLists() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/lists')
        if (response.ok) {
          const data = await response.json()
          // Check which lists contain this game
          const listsWithStatus = await Promise.all(
            data.lists.map(async (list: List) => {
              const checkRes = await fetch(`/api/lists/${list.id}`)
              if (checkRes.ok) {
                const listData = await checkRes.json()
                const gameInList = listData.list.list_items?.some(
                  (item: { game_id: number }) => item.game_id === game.id
                )
                return { ...list, game_in_list: gameInList }
              }
              return list
            })
          )
          setLists(listsWithStatus)
        }
      } catch (error) {
        console.error('Failed to fetch lists:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLists()
  }, [isOpen, game.id])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowCreate(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleList = async (listId: string, isInList: boolean) => {
    try {
      if (isInList) {
        // Remove from list
        await fetch(`/api/lists/${listId}/items?game_id=${game.id}`, {
          method: 'DELETE',
        })
      } else {
        // Add to list
        await fetch(`/api/lists/${listId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_id: game.id,
            game_slug: game.slug,
            game_name: game.name,
            game_cover_id: game.cover_id,
          }),
        })
      }

      // Update local state
      setLists(lists.map(list =>
        list.id === listId ? { ...list, game_in_list: !isInList } : list
      ))
    } catch (error) {
      console.error('Failed to update list:', error)
    }
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListName.trim()) return

    setCreating(true)
    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        // Add game to the new list
        await fetch(`/api/lists/${data.list.id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_id: game.id,
            game_slug: game.slug,
            game_name: game.name,
            game_cover_id: game.cover_id,
          }),
        })

        setLists([{ ...data.list, game_in_list: true }, ...lists])
        setNewListName('')
        setShowCreate(false)
      }
    } catch (error) {
      console.error('Failed to create list:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-background-secondary border border-purple/20 rounded-lg/40"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Add to List</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 glass border border-purple/20 rounded-lg shadow-xl z-50">
          {isLoading ? (
            <div className="p-4 text-center text-foreground-muted">Loading...</div>
          ) : (
            <>
              {/* Create new list form */}
              {showCreate ? (
                <form onSubmit={handleCreateList} className="p-3 border-b border-purple/10">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="List name"
                    className="w-full bg-background-secondary border border-purple/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={creating || !newListName.trim()}
                      className="flex-1 bg-purple text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
                    >
                      {creating ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="px-3 py-1.5 text-sm text-foreground-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full flex items-center gap-2 p-3 text-sm text-purple border-b border-purple/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create new list
                </button>
              )}

              {/* Existing lists */}
              <div className="max-h-64 overflow-y-auto">
                {lists.length === 0 ? (
                  <div className="p-4 text-center text-foreground-muted text-sm">
                    No lists yet
                  </div>
                ) : (
                  lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleToggleList(list.id, !!list.game_in_list)}
                      className="w-full flex items-center gap-3 p-3 text-left"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        list.game_in_list
                          ? 'bg-purple border-purple'
                          : 'border-foreground-muted/30'
                      }`}>
                        {list.game_in_list && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm truncate">{list.name}</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
