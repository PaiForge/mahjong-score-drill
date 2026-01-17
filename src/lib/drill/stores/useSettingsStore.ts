import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
    requireYaku: boolean
    setRequireYaku: (enabled: boolean) => void
    simplifyMangan: boolean
    setSimplifyMangan: (enabled: boolean) => void
    requireFuForMangan: boolean
    setRequireFuForMangan: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            requireYaku: false,
            setRequireYaku: (requireYaku) => set({ requireYaku }),
            simplifyMangan: false,
            setSimplifyMangan: (simplifyMangan) => set({ simplifyMangan }),
            requireFuForMangan: false,
            setRequireFuForMangan: (requireFuForMangan) => set({ requireFuForMangan }),
        }),
        {
            name: 'mahjong-drill-settings',
        }
    )
)
