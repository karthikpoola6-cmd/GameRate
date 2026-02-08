'use client'

import dynamic from 'next/dynamic'

const NeonGrid = dynamic(
  () => import('@/components/NeonGrid').then(m => ({ default: m.NeonGrid })),
  { ssr: false }
)

export function NeonGridLazy() {
  return <NeonGrid />
}
