import { Navigation } from '@/components/Navigation'
import { CreateListForm } from '@/components/CreateListForm'

export default function CreateListPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-8">Create New List</h1>
          <CreateListForm />
        </div>
      </main>
    </div>
  )
}
