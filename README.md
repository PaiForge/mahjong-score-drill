# Mahjong Score Drill

リーチ麻雀の点数計算を練習するためのWebアプリケーションです。

## 技術スタック (Tech Stack)

このプロジェクトは以下の最新技術スタックで構築されています：

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.9+
- **UI Architecture**:
  - [React 19](https://react.dev/)
  - [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Mahjong Libraries**:
  - [`@pai-forge/mahjong-react-ui`](https://github.com/PaiForge/mahjong-react-ui) - 用于显示麻雀牌和和牌的轻量级 UI 库
  - [`@pai-forge/riichi-mahjong`](https://github.com/PaiForge/riichi-mahjong) - リーチ麻雀のルール・計算ロジック

## 開発環境のセットアップ (Getting Started)

### 前提条件 (Prerequisites)

- Node.js 24.x 以上
- npm（Node.js に同梱）

### インストール (Installation)

```bash
npm install
```

### 開発サーバーの起動 (Development)

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認してください。

### ビルド (Build)

```bash
npm run build
```

## プロジェクト構成 (Project Structure)

詳細なアーキテクチャについては [docs/architecture.md](docs/architecture.md) を参照してください。

```
src/
├── app/                          # Next.js App Router
│   ├── (home)/                   # ホーム画面
│   ├── drill/                    # ドリル画面
│   └── _components/              # 共通コンポーネント
└── lib/                          # 共有ロジック (麻雀計算、ユーティリティ等)
```
