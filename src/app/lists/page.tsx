import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ListsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Get user's username and redirect to their lists
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    if (profile?.username) {
      redirect(`/user/${profile.username}/lists`)
    }
  }

  // If not logged in, redirect to home
  redirect('/')
}
