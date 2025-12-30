import type { Metadata } from 'next'
import './globals.css'
import OfflineNotification from '../components/OfflineNotification'

export const metadata: Metadata = {
  title: 'Restaurant POS - Store',
  description: '店舗向けPOS画面',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <OfflineNotification />
        {children}
      </body>
    </html>
  )
}
