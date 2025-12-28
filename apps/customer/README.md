# 顧客向けセルフオーダーアプリ

テーブルのQRコードをスキャンして、メニューから注文できる顧客向けアプリです。

## 機能概要

### 1. QRコードログイン (`/customer/scan`)
- テーブルのQRコードをカメラでスキャン
- 手動入力フォーム（テスト用・カメラ使用不可時）
- 自動でメニューページへリダイレクト

### 2. メニュー・注文 (`/customer/menu`)
- カテゴリ別メニュー表示
- カート機能（追加・削除・数量変更）
- 合計金額リアルタイム計算
- 注文送信

### 3. 注文状況確認 (`/customer/orders`)
- 注文一覧表示
- 5秒ごとの自動更新（ポーリング）
- ステータス別表示:
  - 📝 注文受付済み
  - 🍳 調理中
  - ✅ 調理完了
  - 🍽️ 配膳済み
  - 💳 会計済み

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **QR Scanner**: html5-qrcode
- **Authentication**: JWT (localstorage)
- **Real-time Updates**: Polling (5秒間隔)

## セットアップ

### 前提条件
- Node.js 18+
- pnpm

### インストール

```bash
# 依存関係インストール（monorepo root から）
cd /workspace/front
pnpm install
```

### 開発サーバー起動

```bash
# 顧客アプリのみ起動
pnpm -F customer dev

# または全アプリ起動
pnpm dev
```

アプリは http://localhost:3004 で起動します。

## ディレクトリ構成

```
apps/customer/
├── app/
│   ├── scan/                 # QRスキャンページ
│   │   └── page.tsx
│   ├── menu/                 # メニュー・カートページ
│   │   └── page.tsx
│   └── orders/               # 注文状況ページ
│       └── page.tsx
├── components/
│   └── QRScanner.tsx         # QRスキャナーコンポーネント
├── hooks/
│   └── usePolling.ts         # ポーリングフック
└── tsconfig.json
```

## API エンドポイント

### 認証
- `POST /api/customer/auth/login_via_qr` - QRログイン
- `POST /api/customer/auth/logout` - ログアウト

### メニュー
- `GET /api/customer/menu_items` - 利用可能メニュー一覧

### 注文
- `POST /api/customer/orders` - 注文作成
- `GET /api/customer/orders` - 自分のテーブルの注文一覧（未払いのみ）

## セキュリティ

### テーブルスコープアクセス制御
- 顧客は自分のテーブルの注文のみ閲覧・作成可能
- JWTトークンに`table_id`を含む
- バックエンドで`current_table`を検証

### JWT構造
```json
{
  "table_id": 21,
  "tenant_id": 1,
  "store_id": 1,
  "user_type": "customer",
  "exp": 1767013282
}
```

### ローカルストレージ
- `customer_token`: JWT認証トークン
- `customer_session`: セッション情報（テーブル番号、店舗名など）

## 使用方法

### 顧客の利用フロー

1. **QRコードスキャン**
   - テーブルのQRコードをスキャン
   - 自動ログイン→メニューページへ

2. **メニュー閲覧・注文**
   - カテゴリ別にメニューを表示
   - カートに商品を追加
   - 「注文する」ボタンで送信

3. **注文状況確認**
   - 「注文状況を見る」ボタンをクリック
   - リアルタイムで調理状況を確認

4. **会計**
   - スタッフに声をかける（アプリでの決済機能なし）

### テスト用QRコード

開発環境では、以下のQRコードでテストできます:
```
1-1-T1-fd0de71dfcd4d7db
```

このコードを手動入力フォームに貼り付けてテストしてください。

## トラブルシューティング

### カメラが起動しない
- ブラウザのカメラ権限を確認
- HTTPSが必要（localhostは除く）
- 手動入力フォームを使用

### 注文が更新されない
- ネットワーク接続を確認
- ブラウザの開発者ツールでAPIエラーを確認
- 「今すぐ更新」ボタンで手動更新

### ログインできない
- QRコードが正しいか確認
- テーブルのステータスが`available`または`reserved`か確認
- バックエンドサーバーが起動しているか確認

## 今後の拡張候補

- [ ] 注文のキャンセル/編集機能
- [ ] 顧客アカウント登録（注文履歴保存用）
- [ ] プッシュ通知（調理完了時）
- [ ] オンライン決済統合
- [ ] 多言語対応
- [ ] ダークモード
- [ ] PWA対応（オフライン動作）

## ライセンス

このプロジェクトは開発中です。
