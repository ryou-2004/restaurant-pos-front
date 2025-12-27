# types/

このディレクトリには、OpenAPI仕様から自動生成されるTypeScript型定義が含まれます。

## 自動生成ファイル

### `api.ts`

**重要: このファイルは手動で編集しないでください**

- OpenAPI仕様 (`../api/swagger/v1/swagger.json`) から自動生成されます
- 生成コマンド: `pnpm generate:types`
- バックエンドのAPI仕様が変更されたら、必ずこのコマンドを実行して型を更新してください

## 型の使用方法

このファイルの型を直接使用するのではなく、`lib/api/` ディレクトリのAPIクライアント関数で型を抽出して使用します。

**悪い例 (コンポーネントで直接使用)**:
```typescript
import type { paths } from '@/types/api'

type Store = paths['/api/tenant/stores']['get']['responses']['200']['content']['application/json'][number]
```

**良い例 (APIクライアント関数で抽出)**:
```typescript
// lib/api/tenant/stores.ts
import type { paths } from '@/types/api'

type Store = paths['/api/tenant/stores']['get']['responses']['200']['content']['application/json'][number]
export type { Store }

// コンポーネント
import type { Store } from '@/lib/api/tenant/stores'
```

## 更新フロー

1. バックエンドでAPIを変更
2. RSpecテストを更新 (OpenAPI仕様を含む)
3. `bundle exec rake rswag:specs:swaggerize` を実行 (swagger.json生成)
4. フロントエンドで `pnpm generate:types` を実行 (api.ts生成)
5. TypeScriptコンパイルエラーで影響箇所を確認
6. 必要に応じてAPIクライアント関数やコンポーネントを修正
7. 両方をコミット
