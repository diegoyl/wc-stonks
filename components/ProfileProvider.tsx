'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'wc-stonks:player'

interface ProfileContextValue {
  playerId: string | null
  setPlayerId: (id: string | null) => void
  pickerOpen: boolean
  openPicker: () => void
  closePicker: () => void
}

const ProfileContext = createContext<ProfileContextValue>({
  playerId: null,
  setPlayerId: () => {},
  pickerOpen: false,
  openPicker: () => {},
  closePicker: () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [playerId, setPlayerIdState] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setPlayerIdState(stored)
    else setPickerOpen(true)
    setHydrated(true)
  }, [])

  function setPlayerId(id: string | null) {
    setPlayerIdState(id)
    if (id) localStorage.setItem(STORAGE_KEY, id)
    else localStorage.removeItem(STORAGE_KEY)
  }

  if (!hydrated) return null

  return (
    <ProfileContext.Provider value={{ playerId, setPlayerId, pickerOpen, openPicker: () => setPickerOpen(true), closePicker: () => setPickerOpen(false) }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
