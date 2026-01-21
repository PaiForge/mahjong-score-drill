# アーキテクチャ

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router, Turbopack)
- **言語**: TypeScript 5.x
- **UI**: React 19, Tailwind CSS v4
- **状態管理**: Zustand
- **麻雀ライブラリ**: @pai-forge/mahjong-react-ui, @pai-forge/riichi-mahjong

---

## ディレクトリ構成

```
src/
├── app/                          # Next.js App Router
│   ├── _components/              # 全ページ共通コンポーネント
│   │   └── RiichiStick.tsx
│   ├── (home)/                   # ホーム画面グループ (/)
│   │   ├── _components/
│   │   │   └── SetupScreen.tsx   # Client Component
│   │   └── page.tsx
│   ├── drill/                    # ドリル画面 (/drill)
│   │   ├── _components/          # ドリル専用コンポーネント
│   │   │   ├── DrillBoard.tsx    # メインコンポーネント
│   │   │   ├── QuestionDisplay.tsx
│   │   │   ├── AnswerForm.tsx
│   │   │   ├── ResultDisplay.tsx
│   │   │   ├── YakuSelect.tsx
│   │   │   └── MultiSelect.tsx
│   │   ├── _hooks/
│   │   │   └── useResponsiveHaiSize.ts
│   │   └── page.tsx              # searchParams処理
│   ├── globals.css
│   └── layout.tsx                # RootLayout
└── lib/                          # 共有ロジック
    ├── drill/
    │   ├── types.ts              # 型定義
    │   ├── constants.ts          # 定数 (役一覧等)
    │   ├── stores/
    │   │   └── useDrillStore.ts  # Zustand ストア
    │   └── utils/                # ユーティリティ
    │       ├── questionGenerator.ts
    │       ├── queryQuestionGenerator.ts
    │       ├── scoreCalculator.ts
    │       ├── fuCalculator.ts
    │       ├── judgement.ts
    │       └── haiNames.ts
    └── shims/
        └── react-native.ts       # React Native 互換shim
```

### ディレクトリ命名規則

- `_components/`, `_hooks/` - アンダースコアプレフィックスでプライベートディレクトリ（ルーティング対象外）
- `(home)/` - Route Groups（URLに影響しない論理的グルーピング）
- `lib/` - ページ横断で使用する共有コード

---


## 設定ファイル

### next.config.ts

`react-native` エイリアスを設定。@pai-forge/mahjong-react-ui が React Native にも対応しているため、Web 環境では `src/lib/shims/react-native.ts` で互換レイヤーを提供。

```typescript
turbopack: {
  resolveAlias: {
    'react-native': './src/lib/shims/react-native.ts',
  },
},
```

---

