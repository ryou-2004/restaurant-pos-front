'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // トークンがあればログインページへ自動リダイレクト
    const token = localStorage.getItem('tenant_token')
    if (token) {
      router.push('/login')
    }
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Restaurant POS
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            テナント向け管理画面
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg"
          >
            ログイン画面へ
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          店舗オーナー・マネージャー用ログインページです
        </p>
      </div>
    </main>
  )
}
