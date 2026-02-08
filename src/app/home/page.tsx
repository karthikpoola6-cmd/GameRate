import { redirect } from "next/navigation";
import { getPopularGamesPool } from "@/lib/igdb";
import { Navigation } from "@/components/Navigation";
import { ActivityFeed } from "@/components/ActivityFeed";
import { PopularGamesClient } from "@/components/PopularGamesClient";
import { FadeIn } from "@/components/FadeIn";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  // Check if user has completed profile setup
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  // If no profile or username, redirect to setup
  if (!profile?.username) {
    redirect('/setup-username');
  }

  const popularGamesPool = await getPopularGamesPool();

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-4 lg:pt-24 pb-16 px-4">
        <div className="max-w-4xl lg:max-w-6xl mx-auto">
          {/* Activity Feed */}
          <section className="mb-12">
            <FadeIn>
              <h2 className="text-lg font-medium tracking-wide mb-6">Friend Activity</h2>
            </FadeIn>
            <FadeIn delay={150}>
              <ActivityFeed userId={user.id} />
            </FadeIn>
          </section>

          {/* Popular Games */}
          <section>
            <h2 className="text-lg font-medium tracking-wide mb-6">Popular Games</h2>
            <PopularGamesClient pool={popularGamesPool} />
          </section>
        </div>
      </main>
    </div>
  );
}
