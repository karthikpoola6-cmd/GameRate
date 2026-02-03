'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function CreateListForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isRanked, setIsRanked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('List name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        setLoading(false)
        return
      }

      const { data: list, error: createError } = await supabase
        .from('lists')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          is_public: isPublic,
          is_ranked: isRanked,
        })
        .select()
        .single()

      if (createError) {
        setError(createError.message)
        setLoading(false)
        return
      }

      router.push(`/list/${list.id}`)
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          List Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Best RPGs, Games to Play..."
          className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description <span className="text-foreground-muted">(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What's this list about?"
          className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 resize-none"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-12 h-6 rounded-full ${
              isPublic ? 'bg-purple' : 'bg-background-secondary'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full ${
                isPublic ? 'left-7' : 'left-1'
              }`}
            />
          </button>
          <span className="text-sm">
            {isPublic ? 'Public' : 'Private'} list
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsRanked(!isRanked)}
            className={`relative w-12 h-6 rounded-full ${
              isRanked ? 'bg-purple' : 'bg-background-secondary'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full ${
                isRanked ? 'left-7' : 'left-1'
              }`}
            />
          </button>
          <span className="text-sm">
            {isRanked ? 'Ranked' : 'Unranked'} list
          </span>
          <span className="text-xs text-foreground-muted">
            (shows position numbers)
          </span>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-purple disabled:opacity-50 text-white py-3 rounded-lg font-medium"
        >
          {loading ? 'Creating...' : 'Create List'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-foreground-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
