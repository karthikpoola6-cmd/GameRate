import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/lists/[id] - Get a single list with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: list, error } = await supabase
    .from('lists')
    .select(`
      *,
      profiles:user_id (username, display_name, avatar_url),
      list_items (*)
    `)
    .eq('id', id)
    .single()

  if (error || !list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 })
  }

  // Sort items by position
  if (list.list_items) {
    list.list_items.sort((a: { position: number }, b: { position: number }) => a.position - b.position)
  }

  return NextResponse.json({ list })
}

// PATCH /api/lists/[id] - Update a list
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, is_public } = body

  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name.trim()
  if (description !== undefined) updates.description = description?.trim() || null
  if (is_public !== undefined) updates.is_public = is_public

  const { data: list, error } = await supabase
    .from('lists')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ list })
}

// DELETE /api/lists/[id] - Delete a list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
