import { useState, useEffect, useCallback } from 'react'
import type { HaiSize } from '@pai-forge/mahjong-react-ui'

/**
 * 画面幅に応じて牌のサイズを返すフック
 * スマホでも14枚が1行に収まるようにする
 * mahjong-soloの実装を参考
 */
export function useResponsiveHaiSize(): HaiSize {
  const getSize = useCallback((): HaiSize => {
    if (typeof window === 'undefined') return 'sm'
    const height = window.innerHeight
    const width = window.innerWidth
    // 縦向きスマホ（幅が狭い）は xs
    if (width < 500) return 'xs'
    // 横向きスマホ（高さが低いが幅は十分）は sm
    if (height < 500 && width > height) return 'sm'
    // それ以外は sm
    return 'sm'
  }, [])

  const [size, setSize] = useState<HaiSize>(getSize)

  useEffect(() => {
    const updateSize = () => {
      setSize(getSize())
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    window.addEventListener('orientationchange', updateSize)
    return () => {
      window.removeEventListener('resize', updateSize)
      window.removeEventListener('orientationchange', updateSize)
    }
  }, [getSize])

  return size
}
