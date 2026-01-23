import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/lists/[id]/items - Add a game to a list
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify list ownership
  const { data: list } = await supabase
    .from('lists')
    .select('id')
    .eq('id', listId)
    .eq('user_id', user.id)
    .single()

  if (!list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 })
  }

  const body = await request.json()
  const { game_id, game_slug, game_name, game_cover_id, notes } = body

  if (!game_id || !game_slug || !game_name) {
    return NextResponse.json({ error: 'Game info required' }, { status: 400 })
  }

  // Get max position
  const { data: maxPos } = await supabase
    .from('list_items')
    .select('position')
    .eq('list_id', listId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (maxPos?.position ?? -1) + 1

  const { data: item, error } = await supabase
    .from('list_items')
    .insert({
      list_id: listId,
      game_id,
      game_slug,
      game_name,
      game_cover_id: game_cover_id || null,
      notes: notes?.trim() || null,
      position,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Game already in list' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item })
}

// DELETE /api/lists/[id]/items - Remove a game from a list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get('game_id')

  if (!gameId) {
    return NextResponse.json({ error: 'game_id required' }, { status: 400 })
  }

  // Verify list ownership
  const { data: list } = await supabase
    .from('lists')
    .select('id')
    .eq('id', listId)
    .eq('user_id', user.id)
    .single()

  if (!list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', listId)
    .eq('game_id', parseInt(gameId))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
