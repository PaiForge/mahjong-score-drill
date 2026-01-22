'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface SidebarContextValue {
    readonly isOpen: boolean
    readonly toggleSidebar: () => void
    readonly closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

interface SidebarProviderProps {
    readonly children: ReactNode
}

/**
 * サイドバーの開閉状態を管理するProvider
 */
export function SidebarProvider({ children }: SidebarProviderProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleSidebar = useCallback(() => {
        setIsOpen((prev) => !prev)
    }, [])

    const closeSidebar = useCallback(() => {
        setIsOpen(false)
    }, [])

    return (
        <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
            {children}
        </SidebarContext.Provider>
    )
}

/**
 * サイドバーの開閉状態を取得するhook
 */
export function useSidebar(): SidebarContextValue {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
}
