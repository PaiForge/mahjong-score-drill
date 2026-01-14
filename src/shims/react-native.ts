// Web ビルド用の React Native shim
// @pai-forge/mahjong-react-ui が React Native にも対応しているため、
// Web 環境では互換コンポーネントを提供する

import React from 'react'

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
}

// React Native スタイル配列を Web スタイルオブジェクトに変換
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenStyle(style: any): React.CSSProperties {
  if (!style) return {}

  if (Array.isArray(style)) {
    // 配列の場合、各要素をマージ
    return style.reduce((acc, s) => {
      if (s) {
        return { ...acc, ...flattenStyle(s) }
      }
      return acc
    }, {} as React.CSSProperties)
  }

  if (typeof style === 'object') {
    // transform を Web 形式に変換
    if (style.transform && Array.isArray(style.transform)) {
      const transformStr = style.transform
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((t: any) => {
          if (t.rotate) return `rotate(${t.rotate})`
          if (t.translateY !== undefined) return `translateY(${t.translateY}px)`
          if (t.translateX !== undefined) return `translateX(${t.translateX}px)`
          if (t.scale !== undefined) return `scale(${t.scale})`
          return ''
        })
        .filter(Boolean)
        .join(' ')

      return {
        ...style,
        transform: transformStr,
      }
    }
    return style
  }

  return {}
}

type PressableProps = {
  onPress?: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any
  children?: React.ReactNode
  accessibilityRole?: string
  accessibilityLabel?: string
}

export const Pressable = ({
  onPress,
  style,
  children,
}: PressableProps) => {
  const flatStyle = flattenStyle(style)
  return React.createElement(
    'div',
    {
      onClick: onPress,
      style: { cursor: onPress ? 'pointer' : 'default', ...flatStyle },
    },
    children
  )
}

type ImageProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any
  resizeMode?: string
}

export const Image = ({ source, style, resizeMode }: ImageProps) => {
  let src = ''
  if (typeof source === 'object' && source && 'uri' in source) {
    src = source.uri
  } else if (typeof source === 'string') {
    src = source
  }

  const flatStyle = flattenStyle(style)
  const objectFit =
    resizeMode === 'contain'
      ? 'contain'
      : resizeMode === 'cover'
        ? 'cover'
        : undefined

  return React.createElement('img', {
    src,
    style: { ...flatStyle, objectFit },
    draggable: false,
  })
}

export default {}
