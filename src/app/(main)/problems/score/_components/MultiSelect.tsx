import { useState } from 'react'
import { Modal } from '@/app/_components/Modal'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
    value: string
    label: string
}

interface Props {
    options: MultiSelectOption[]
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    labels?: {
        add: string
        title: string
        done: string
    }
}

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = 'Select',
    disabled = false,
    className = '',
    labels = {
        add: '役を追加',
        title: '役を選択',
        done: '完了'
    }
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleRemove = (optionToRemove: string) => {
        onChange(value.filter((v) => v !== optionToRemove))
    }

    const toggleOption = (optionValue: string) => {
        if (value.includes(optionValue)) {
            handleRemove(optionValue)
        } else {
            onChange([...value, optionValue])
        }
    }

    const getLabel = (val: string) => {
        return options.find(opt => opt.value === val)?.label || val
    }

    return (
        <div className={cn("w-full", className)}>
            {/* Chips Display / Trigger */}
            <div
                className={cn(
                    "min-h-[46px] w-full px-2 py-2 border border-slate-300 rounded-lg bg-white flex flex-wrap gap-2 items-center",
                    disabled ? 'bg-slate-100 cursor-not-allowed' : 'cursor-pointer'
                )}
                onClick={() => !disabled && setIsModalOpen(true)}
            >
                {value.length > 0 ? (
                    <>
                        {value.map((v) => (
                            <span
                                key={v}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-sm rounded-md"
                            >
                                {getLabel(v)}
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(v)}
                                        className="ml-2 text-amber-600 hover:text-amber-900 focus:outline-none"
                                    >
                                        ×
                                    </button>
                                )}
                            </span>
                        ))}
                    </>
                ) : (
                    <span className="text-slate-400 text-sm px-1">{placeholder}</span>
                )}

                {/* Add Button - Only show when items are selected */}
                {!disabled && value.length > 0 && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsModalOpen(true)
                        }}
                        className="ml-auto p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                        title={labels.add}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                )}
            </div>

            {/* Modal Selection */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="flex flex-col h-[70vh] md:h-96">
                    <h3 className="text-lg font-bold mb-4 text-slate-900">{labels.title}</h3>
                    <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg">
                        {options.map((option) => {
                            const isSelected = value.includes(option.value)
                            return (
                                <div
                                    key={option.value}
                                    onClick={() => toggleOption(option.value)}
                                    className={cn(
                                        "px-4 py-3 cursor-pointer transition-colors text-sm border-b border-slate-100 last:border-0",
                                        isSelected
                                            ? 'bg-amber-100 text-amber-900 font-medium'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option.label}</span>
                                        {isSelected && (
                                            <span className="text-amber-600 text-lg leading-none">✓</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            {labels.done}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
