import { create } from 'zustand'

type Role = 'oya' | 'ko'
type ViewMode = 'normal' | 'high_score'
type WinType = 'ron' | 'tsumo'

interface ScoreTableState {
    activeTab: Role
    viewMode: ViewMode
    winType: WinType
    hiddenCells: Record<string, boolean>
    highlightedCellId: string | null
}

interface ScoreTableActions {
    setActiveTab: (role: Role) => void
    toggleRole: () => void
    setViewMode: (mode: ViewMode) => void
    toggleViewMode: () => void
    setWinType: (type: WinType) => void
    toggleCellVisibility: (id: string) => void
    setHighlightedCellId: (id: string | null) => void
}

export const useScoreTableStore = create<ScoreTableState & ScoreTableActions>((set) => ({
    activeTab: 'ko',
    viewMode: 'normal',
    winType: 'ron',
    hiddenCells: {},
    highlightedCellId: null,

    setActiveTab: (role) => set({ activeTab: role, highlightedCellId: null }),
    toggleRole: () => set((state) => ({ activeTab: state.activeTab === 'ko' ? 'oya' : 'ko', highlightedCellId: null })),
    setViewMode: (mode) => set({ viewMode: mode }),
    toggleViewMode: () => set((state) => ({ viewMode: state.viewMode === 'normal' ? 'high_score' : 'normal' })),
    setWinType: (type) => set({ winType: type, highlightedCellId: null }),
    toggleCellVisibility: (id) => set((state) => ({
        hiddenCells: {
            ...state.hiddenCells,
            [id]: !state.hiddenCells[id]
        }
    })),
    setHighlightedCellId: (id) => set({ highlightedCellId: id }),
}))
