import { create } from 'zustand'

type Role = 'oya' | 'ko'
type ViewMode = 'normal' | 'high_score'
type WinType = 'ron' | 'tsumo'

interface ScoreTableState {
    activeTab: Role
    viewMode: ViewMode
    winType: WinType
    hiddenCells: Record<string, boolean>
}

interface ScoreTableActions {
    setActiveTab: (role: Role) => void
    toggleRole: () => void
    setViewMode: (mode: ViewMode) => void
    toggleViewMode: () => void
    setWinType: (type: WinType) => void
    toggleCellVisibility: (id: string) => void
}

export const useScoreTableStore = create<ScoreTableState & ScoreTableActions>((set) => ({
    activeTab: 'ko',
    viewMode: 'normal',
    winType: 'ron',
    hiddenCells: {},

    setActiveTab: (role) => set({ activeTab: role }),
    toggleRole: () => set((state) => ({ activeTab: state.activeTab === 'ko' ? 'oya' : 'ko' })),
    setViewMode: (mode) => set({ viewMode: mode }),
    toggleViewMode: () => set((state) => ({ viewMode: state.viewMode === 'normal' ? 'high_score' : 'normal' })),
    setWinType: (type) => set({ winType: type }),
    toggleCellVisibility: (id) => set((state) => ({
        hiddenCells: {
            ...state.hiddenCells,
            [id]: !state.hiddenCells[id]
        }
    })),
}))
