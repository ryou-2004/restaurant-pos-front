# Restaurant POS Frontend

飲食店向けマルチテナント対応POSシステムのフロントエンド群。

## ディレクトリ構成

```
front/
├── apps/
│   ├── staff/          # スタッフ向け（システム管理）
│   ├── tenant/         # テナント向け（店舗オーナー・マネージャー）
│   ├── store/          # 店舗向け（POS画面・注文管理）
│   └── customer/       # 顧客向け（セルフオーダー・予約）
├── packages/
│   └── ui/             # 共通UIコンポーネント
├── turbo.json          # Turborepo設定
├── pnpm-workspace.yaml # pnpm workspaces設定
└── package.json
```

## 各アプリケーションの役割

| アプリ | 対象ユーザー | 主な機能 | デプロイ先例 |
|--------|-------------|---------|-------------|
| staff | システム管理者 | テナント管理、プラン管理、システム設定 | staff.example.com |
| tenant | テナントオーナー・マネージャー | 店舗設定、メニュー管理、売上分析、スタッフ管理 | admin.example.com |
| store | 店舗スタッフ | 注文受付、調理管理、配膳管理、会計 | pos.example.com |
| customer | 一般顧客 | セルフオーダー、予約、履歴確認 | order.example.com |

## 技術選定

### Turborepo + pnpm workspaces を選択した理由

#### 1. モノレポ管理の必要性

4つのフロントエンドアプリケーションが存在し、以下の課題がある：
- 共通UIコンポーネントの重複開発を避けたい
- 依存関係のバージョンを統一したい
- 開発体験を統一したい

#### 2. pnpm workspaces

**選定理由:**
- npm/yarnより高速なインストール（ハードリンク活用）
- 厳格な依存関係管理（幽霊依存関係を防止）
- ディスク容量の効率化
- `pnpm -F <app> <command>` で特定アプリのみ操作可能

#### 3. Turborepo

**選定理由:**
- **ビルドキャッシュ**: 変更のないパッケージはビルドをスキップ
- **並列実行**: 依存関係を考慮した最適な並列ビルド
- **リモートキャッシュ**: CI/CD間でキャッシュを共有可能
- **Next.js公式推奨**: Vercel製でNext.jsとの相性が最良

**具体的なメリット:**
```
# 4アプリ全ビルド時間の比較（概算）
従来: 各アプリ60秒 × 4 = 240秒（直列）
Turborepo: 60秒（並列） + キャッシュで2回目以降は数秒
```

### 各アプリケーションの技術スタック

| 技術 | バージョン | 選定理由 |
|------|-----------|---------|
| Next.js | 14 (App Router) | RSC対応、SSR/SSG柔軟、Vercelとの親和性 |
| TypeScript | 5+ | 型安全、開発効率向上 |
| Tailwind CSS | 3+ | ユーティリティファースト、共通デザイントークン |
| React | 18+ | Server Components、Suspense対応 |

### PWA対応（store/customer向け）

店舗POSと顧客向けアプリはPWA対応：
- オフライン動作（店舗の通信障害対策）
- ホーム画面追加
- プッシュ通知

## 開発コマンド

```bash
# 依存関係インストール
pnpm install

# 全アプリ開発サーバー起動
pnpm dev

# 特定アプリのみ起動
pnpm -F staff dev
pnpm -F tenant dev
pnpm -F store dev
pnpm -F customer dev

# 全アプリビルド
pnpm build

# 特定アプリのみビルド
pnpm -F store build

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

## Git管理

- リポジトリ: https://github.com/ryou-2004/restaurant-pos-front
- APIリポジトリ: https://github.com/ryou-2004/restaurant-pos-api

## 関連ドキュメント

- [API仕様](../api/README.md)
- [システム設計](../docs/)
