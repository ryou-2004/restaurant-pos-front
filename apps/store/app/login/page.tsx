'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LoginResponse } from '../../../../types/store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3000/api/store/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      const data: LoginResponse | { error: string } = await response.json()

      if (response.ok && 'token' in data) {
        localStorage.setItem('store_token', data.token)
        localStorage.setItem('store_user', JSON.stringify(data.user))
        // 店舗選択画面へリダイレクト
        router.push('/select-store')
      } else {
        setError('error' in data ? data.error : 'ログインに失敗しました')
      }
    } catch (err) {
      setError('サーバーに接続できません')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleLogin(email, password)
  }

  const handleTestLogin = async () => {
    await handleLogin('staff@demo-enterprise.local', 'password123')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">店舗POSログイン</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="staff@demo-enterprise.local"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="パスワード"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            テストアカウントでログイン
          </button>
        </div>
      </div>
    </div>
  )
}
