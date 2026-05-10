import { createContext, useContext, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSettings, HouseholdSettings } from '../api/tickets'

interface SettingsContextValue {
  settings: HouseholdSettings | undefined
  member1Name: string
  member2Name: string
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: undefined,
  member1Name: 'Me',
  member2Name: 'Partner',
  isLoading: true,
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  })

  return (
    <SettingsContext.Provider
      value={{
        settings,
        member1Name: settings?.member1_name ?? 'Me',
        member2Name: settings?.member2_name ?? 'Partner',
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
