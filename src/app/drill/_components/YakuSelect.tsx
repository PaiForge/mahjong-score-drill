'use client'

import { YAKU_OPTIONS } from '@/lib/drill/constants'
import { MultiSelect } from './MultiSelect'

interface Props {
    value: string[]
    onChange: (value: string[]) => void
    disabled?: boolean
}

export function YakuSelect({ value, onChange, disabled }: Props) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
                役
            </label>
            <MultiSelect
                options={YAKU_OPTIONS}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder="役を選択（複数選択可）"
            />

        </div>
    )
}
