import type { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
    width?: number | string
}

export function RiichiStick({ width = 120, className = '', ...props }: Props) {
    return (
        <div
            className={`relative inline-flex items-center justify-center h-2 bg-white rounded-sm shadow-md border border-gray-300 overflow-hidden ${className}`}
            style={{ width }}
            {...props}
        >
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
        </div>
    )
}
