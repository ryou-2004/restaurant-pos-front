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

## 各アプリケーションの実装状況

各アプリケーションの詳細な実装状況・実装予定は、それぞれのREADMEを参照してください：

| アプリ | ポート | README | 概要 |
|--------|-------|--------|------|
| 👨‍💼 **Staff** | 3001 | [apps/staff/README.md](apps/staff/README.md) | システム管理者向け - テナント管理、プラン管理 |
| 🏪 **Tenant** | 3002 | [apps/tenant/README.md](apps/tenant/README.md) | テナントオーナー向け - メニュー管理、売上分析、店舗設定 |
| 🍽️ **Store** | 3003 | [apps/store/README.md](apps/store/README.md) | 店舗スタッフ向け - 注文受付、調理管理、会計 |
| 🛎️ **Customer** | 3004 | [apps/customer/README.md](apps/customer/README.md) | 一般顧客向け - セルフオーダー、注文状況確認、会計

---

## API開発フロー（契約駆動開発）

### 基本方針

**OpenAPI仕様 = Single Source of Truth**

- バックエンドとフロントエンドの型不一致を防止
- OpenAPI仕様から自動的にTypeScript型を生成
- APIクライアント関数で認証・エラーハンドリングを共通化

### ディレクトリ構成

```
front/
├── lib/
│   └── api/
│       ├── client.ts              # 共通APIクライアント（認証・エラーハンドリング）
│       ├── tenant/
│       │   ├── stores.ts          # Store API
│       │   ├── users.ts           # User API
│       │   └── reports.ts         # Report API
│       └── store/
│           ├── orders.ts          # Order API
│           └── kitchen-queues.ts  # KitchenQueue API
└── types/
    └── api.ts                     # 自動生成される型（OpenAPIから）
```

### 開発フロー

#### 1. OpenAPI仕様の作成・更新（バックエンド）

```bash
cd api

# RSpecテストにOpenAPI仕様を記述
vi spec/requests/api/tenant/stores_spec.rb

# OpenAPI仕様を自動生成
bundle exec rake rswag:specs:swaggerize
# → swagger/v1/swagger.json が生成される
```

#### 2. TypeScript型の自動生成（フロントエンド）

```bash
cd front

# OpenAPI仕様からTypeScript型を生成
npm run generate:types
# → types/api.ts が自動生成される
```

#### 3. APIクライアント関数の実装

```typescript
// lib/api/tenant/stores.ts
import type { paths } from '@/types/api'
import { apiGet, apiPost } from '../client'

// 型定義（OpenAPIから抽出）
type StoresResponse = paths['/api/tenant/stores']['get']['responses']['200']['content']['application/json']
type Store = StoresResponse[number]

// API関数
export async function fetchStores(): Promise<StoresResponse> {
  return apiGet<StoresResponse>('/api/tenant/stores')
}

export type { Store }
```

#### 4. コンポーネントでの使用

```typescript
import { fetchStores } from '@/lib/api/tenant/stores'
import type { Store } from '@/lib/api/tenant/stores'

const [stores, setStores] = useState<Store[]>([])

const loadStores = async () => {
  try {
    const data = await fetchStores()  // 認証・エラーハンドリング自動
    setStores(data)
  } catch (err) {
    // エラー処理
  }
}
```

### メリット

1. **型の不一致が発生しない** - OpenAPIが唯一の真実の情報源
2. **認証が自動** - localStorage からトークンを自動取得・付与
3. **エラーハンドリングが統一** - 401→ログイン、503→メンテナンス表示など
4. **コンポーネントがシンプル** - API呼び出しロジックが集約される
5. **型定義が読みやすい** - 長い型パスを書かなくて良い

### TODO（実装予定）

- [ ] rswagのセットアップ
- [ ] 既存APIのOpenAPI仕様作成
- [ ] 共通APIクライアント（client.ts）の実装
- [ ] 各APIクライアント関数の実装
- [ ] 既存コンポーネントのリファクタリング
- [ ] メンテナンスモード対応
- [ ] CI/CDでの型生成自動化

詳細は [CLAUDE.md](../CLAUDE.md) の「API開発フロー」セクションを参照。

---

## Git管理

- リポジトリ: https://github.com/ryou-2004/restaurant-pos-front
- APIリポジトリ: https://github.com/ryou-2004/restaurant-pos-api

## 関連ドキュメント

- [API仕様](../api/README.md)
- [システム設計](../docs/)
- [開発ガイドライン](../CLAUDE.md)
