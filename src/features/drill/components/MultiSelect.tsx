import { useState, useRef, useEffect, useMemo } from 'react'

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
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // 選択肢のフィルタリング
    const filteredOptions = useMemo(() => {
        return options.filter((option) =>
            option.includes(searchTerm) && !value.includes(option)
        )
    }, [options, searchTerm, value])

    // クリック外の検知
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
                setSearchTerm('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (option: string) => {
        onChange([...value, option])
        setSearchTerm('')
        inputRef.current?.focus()
    }

    const handleRemove = (optionToRemove: string) => {
        onChange(value.filter((v) => v !== optionToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && searchTerm === '' && value.length > 0) {
            handleRemove(value[value.length - 1])
        }
    }

    return (
        <div
            ref={containerRef}
            className={`relative w-full ${className}`}
        >
            <div
                className={`min-h-[46px] w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-base focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 flex flex-wrap gap-2 items-center cursor-text ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(true)
                        inputRef.current?.focus()
                    }
                }}
            >
                {/* Chips */}
                {value.map((v) => (
                    <span
                        key={v}
                        className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-sm rounded-md"
                    >
                        {v}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemove(v)
                                }}
                                className="ml-1 text-amber-600 hover:text-amber-900 focus:outline-none"
                            >
                                ×
                            </button>
                        )}
                    </span>
                ))}

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setIsOpen(true)
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[60px] outline-none bg-transparent text-gray-900 placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
            </div>

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                                onClick={() => handleSelect(option)}
                            >
                                {option}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-gray-400 text-sm">
                            一致する役がありません
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
