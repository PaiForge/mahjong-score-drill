'use client'
import { ChangeEvent } from 'react'

interface Props {
    options: string[]
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = '選択してください',
    disabled = false,
    className = '',
}: Props) {
    const handleRemove = (optionToRemove: string) => {
        onChange(value.filter((v) => v !== optionToRemove))
    }

    return (
        <div className={`w-full ${className}`}>
            {/* Chips Display */}
            <div
                className={`min-h-[46px] w-full px-1 py-1.5 border border-gray-300 rounded-lg bg-white mb-2 flex flex-wrap gap-2 items-center ${disabled ? 'bg-gray-100' : ''
                    }`}
            >
                {value.length > 0 ? (
                    value.map((v) => (
                        <span
                            key={v}
                            className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-sm rounded-md"
                        >
                            {v}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(v)}
                                    className="ml-1 text-amber-600 hover:text-amber-900 focus:outline-none"
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    ))
                ) : (
                    <span className="text-gray-400 text-sm px-2">役が選択されていません</span>
                )}
            </div>

            {/* Selection Controls */}
            {/* Custom List for All Devices - Responsive Styles */}
            <div className={`w-full border border-gray-300 rounded-lg overflow-y-auto bg-white ${disabled ? 'bg-gray-100' : ''} h-60 md:h-32`}>
                {options.map((option) => {
                    const isSelected = value.includes(option)
                    return (
                        <div
                            key={option}
                            onClick={() => {
                                if (disabled) return
                                if (isSelected) {
                                    handleRemove(option)
                                } else {
                                    const newValues = [...value, option]
                                    onChange(newValues)
                                }
                            }}
                            className={`px-3 cursor-pointer transition-colors text-sm border-b border-gray-100 last:border-0 py-3 md:py-2
                                ${isSelected
                                    ? 'bg-amber-100 text-amber-900 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }
                                ${disabled ? 'cursor-not-allowed opacity-60' : ''}
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {isSelected && (
                                    <span className="text-amber-600 text-lg leading-none">✓</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
