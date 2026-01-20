import { useState } from 'react'
import { Modal } from '@/app/_components/Modal'

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
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleRemove = (optionToRemove: string) => {
        onChange(value.filter((v) => v !== optionToRemove))
    }

    const toggleOption = (option: string) => {
        if (value.includes(option)) {
            handleRemove(option)
        } else {
            onChange([...value, option])
        }
    }

    return (
        <div className={`w-full ${className}`}>
            {/* Chips Display / Trigger */}
            <div
                className={`min-h-[46px] w-full px-2 py-2 border border-gray-300 rounded-lg bg-white flex flex-wrap gap-2 items-center ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
                    }`}
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
                                {v}
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
                    <span className="text-gray-400 text-sm px-1">{placeholder}</span>
                )}

                {/* Add Button - Only show when items are selected */}
                {!disabled && value.length > 0 && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsModalOpen(true)
                        }}
                        className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        title="役を追加"
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
                    <h3 className="text-lg font-bold mb-4 text-gray-900">役を選択</h3>
                    <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                        {options.map((option) => {
                            const isSelected = value.includes(option)
                            return (
                                <div
                                    key={option}
                                    onClick={() => toggleOption(option)}
                                    className={`px-4 py-3 cursor-pointer transition-colors text-sm border-b border-gray-100 last:border-0
                                        ${isSelected
                                            ? 'bg-amber-100 text-amber-900 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }
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
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            完了
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
