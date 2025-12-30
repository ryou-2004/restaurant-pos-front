import type { Metadata } from 'next'
import './globals.css'
import OfflineNotification from '../components/OfflineNotification'

export const metadata: Metadata = {
  title: 'Restaurant POS - Store',
  description: '店舗向けPOS画面',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'POS店舗',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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
