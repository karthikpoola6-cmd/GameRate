import { notFound, redirect } from "next/navigation"
import { getGameBySlug } from "@/lib/igdb"
import { createClient } from "@/lib/supabase/server"
import { BackdropSelector } from "./BackdropSelector"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BackdropPage({ params }: PageProps) {
  const { slug } = await params
  const game = await getGameBySlug(slug)

  if (!game) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/game/${slug}`)
  }

  // Get user's game log
  const { data: gameLog } = await supabase
    .from('game_logs')
    .select('id, custom_backdrop_id')
    .eq('user_id', user.id)
    .eq('game_id', game.id)
    .single()

  if (!gameLog) {
    redirect(`/game/${slug}`)
  }

  const screenshots = game.screenshots || []

  return (
    <div className="min-h-screen bg-background">
      <BackdropSelector
        gameLogId={gameLog.id}
        gameSlug={slug}
        screenshots={screenshots.map(s => s.image_id)}
        currentBackdropId={gameLog.custom_backdrop_id}
        defaultBackdropId={screenshots[0]?.image_id || null}
      />
    </div>
  )
}
