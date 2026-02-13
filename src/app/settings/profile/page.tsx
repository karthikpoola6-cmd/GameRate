'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Cropper, { Area } from 'react-easy-crop'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import type { Profile } from '@/lib/types'

// Helper to create a cropped and compressed image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  maxSize: number = 400
): Promise<Blob> {
  const image = new window.Image()
  image.src = imageSrc
  await new Promise((resolve) => (image.onload = resolve))

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  // Set canvas to desired output size
  canvas.width = maxSize
  canvas.height = maxSize

  // Draw the cropped area scaled to fit
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    maxSize,
    maxSize
  )

  // Convert to blob with compression
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/jpeg',
      0.85 // 85% quality
    )
  })
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  // Cropper state
  const [showCropper, setShowCropper] = useState(false)
  const [cropImage, setCropImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { refreshProfile } = useUser()

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, bio, avatar_url, created_at, updated_at')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setUsername(data.username)
        setDisplayName(data.display_name || '')
        setBio(data.bio || '')
        setAvatarUrl(data.avatar_url || null)
      }
    }
    loadProfile()
  }, [supabase, router])

  // Handle avatar file selection - opens cropper
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // No file size limit now - we'll compress it after cropping
    setError(null)
    setCropImage(URL.createObjectURL(file))
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setShowCropper(true)
  }

  // Handle crop confirmation
  async function handleCropConfirm() {
    if (!cropImage || !croppedAreaPixels) return

    try {
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels, 400)
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })

      setAvatarFile(croppedFile)
      setAvatarPreview(URL.createObjectURL(croppedBlob))
      setShowCropper(false)
      setCropImage(null)
    } catch (err) {
      console.error('Crop error:', err)
      setError('Failed to crop image. Please try again.')
    }
  }

  // Handle crop cancel
  function handleCropCancel() {
    setShowCropper(false)
    setCropImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Upload avatar to Supabase Storage
  // Uses fixed filename per user so new uploads overwrite old ones (no orphaned files)
  async function uploadAvatar(userId: string): Promise<string | null> {
    if (!avatarFile) return avatarUrl

    setUploadingAvatar(true)

    // Fixed filename per user - always overwrites previous avatar
    const fileName = `${userId}.jpg`

    const { error: uploadError } = await supabase.storage
      .from('Avatars')
      .upload(fileName, avatarFile, { upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploadingAvatar(false)
      throw new Error('Failed to upload avatar')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('Avatars')
      .getPublicUrl(fileName)

    // Add cache buster to force browsers to fetch new image
    setUploadingAvatar(false)
    return `${publicUrl}?v=${Date.now()}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not logged in')
      setLoading(false)
      return
    }

    // Upload avatar if changed
    let newAvatarUrl = avatarUrl
    if (avatarFile) {
      try {
        newAvatarUrl = await uploadAvatar(user.id)
      } catch {
        setError('Failed to upload avatar. Please try again.')
        setLoading(false)
        return
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        avatar_url: newAvatarUrl,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Update local state and sync nav
    setAvatarUrl(newAvatarUrl)
    setAvatarFile(null)
    setAvatarPreview(null)
    await refreshProfile()

    setSuccess(true)
    setLoading(false)
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-md border-b border-purple/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <Image src="/GameRate.png" alt="GameRate" width={36} height={36} className="w-9 h-9" />
            <span className="text-xl font-medium tracking-wider bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
              GameRate
            </span>
          </Link>
          <Link
            href={`/user/${profile.username}`}
            className="text-foreground-muted"
          >
            Back to profile
          </Link>
        </div>
      </nav>

      {/* Edit Form */}
      <div className="max-w-xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-8">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm">
              Profile updated successfully!
            </div>
          )}

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-purple/20 flex items-center justify-center border-2 border-purple/30">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-3xl font-bold text-purple">
                      {username.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {/* Pencil edit button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 left-0 w-8 h-8 bg-purple rounded-full flex items-center justify-center shadow-lg border-2 border-background"
                  title="Change photo"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <div className="flex-1">
                <p className="text-xs text-foreground-muted">
                  JPG, PNG or GIF. Any size - we&apos;ll optimize it.
                </p>
                {(avatarUrl || avatarPreview) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null)
                      setAvatarPreview(null)
                      setAvatarUrl(null)
                    }}
                    className="mt-2 text-red-400 text-sm"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Username (read-only) */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">@</span>
              <input
                id="username"
                type="text"
                value={username}
                readOnly
                disabled
                className="w-full bg-background-secondary/50 border border-purple/10 rounded-lg py-3 px-4 pl-8 text-foreground-muted cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              Username cannot be changed
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-2">
              Display Name <span className="text-foreground-muted">(optional)</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 text-foreground focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20"
              placeholder="Your display name"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio <span className="text-foreground-muted">(optional)</span>
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={4}
              className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 text-foreground focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-foreground-muted mt-1 text-right">
              {bio.length}/300
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Danger Zone */}
        <div className="mt-16 pt-8 border-t border-red-500/20">
          <h2 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h2>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-400">Delete Account</h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Permanently delete your account and all data. This cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg font-medium border border-red-500/30"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && cropImage && (
        <div className="fixed inset-0 bg-black/90 flex flex-col z-50">
          {/* Cropper area */}
          <div className="flex-1 relative">
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Controls */}
          <div className="glass border-t border-purple/20 p-4">
            {/* Zoom slider */}
            <div className="flex items-center gap-4 mb-4 max-w-md mx-auto">
              <svg className="w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-purple"
              />
              <svg className="w-5 h-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={handleCropCancel}
                className="flex-1 bg-background-secondary text-foreground py-3 rounded-lg font-medium border border-purple/20"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="flex-1 bg-purple text-white py-3 rounded-lg font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass border border-red-500/20 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-red-400 mb-4">Delete Account</h2>
            <p className="text-foreground-muted mb-4">
              This will permanently delete your account, including all your game logs, lists, ratings, and reviews. This action cannot be undone.
            </p>

            <p className="text-sm text-foreground-muted mb-2">
              Type <span className="text-red-400 font-mono">delete my account</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full bg-background-secondary border border-red-500/20 rounded-lg py-2 px-4 text-foreground focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 mb-4"
              placeholder="delete my account"
            />

            {deleteError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                  setDeleteError(null)
                }}
                className="flex-1 bg-background-secondary text-foreground py-2 rounded-lg font-medium border border-purple/20"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteConfirmation !== 'delete my account') {
                    setDeleteError('Please type the confirmation phrase exactly')
                    return
                  }

                  setDeleting(true)
                  setDeleteError(null)

                  try {
                    const res = await fetch('/api/account/delete', { method: 'DELETE' })
                    const data = await res.json()

                    if (!res.ok) {
                      setDeleteError(data.error || 'Failed to delete account')
                      setDeleting(false)
                      return
                    }

                    // Sign out and redirect
                    await supabase.auth.signOut()
                    router.push('/')
                  } catch {
                    setDeleteError('Something went wrong. Please try again.')
                    setDeleting(false)
                  }
                }}
                disabled={deleting || deleteConfirmation !== 'delete my account'}
                className="flex-1 bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium"
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
