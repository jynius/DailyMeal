import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// 각 테스트 후 자동 정리
afterEach(() => {
  cleanup()
})

// 환경 변수 mock
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'
process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:8000'
process.env.NEXT_PUBLIC_WS_URL = 'http://localhost:8000'
process.env.NEXT_PUBLIC_LOG_LEVEL = 'ERROR'

// 전역 mocks
global.fetch = vi.fn()

// Next.js router mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// localStorage mock (improved)
const localStorageStore: Record<string, string> = {}
global.localStorage = {
  getItem: (key: string) => localStorageStore[key] || null,
  setItem: (key: string, value: string) => {
    localStorageStore[key] = value
  },
  removeItem: (key: string) => {
    delete localStorageStore[key]
  },
  clear: () => {
    Object.keys(localStorageStore).forEach(key => delete localStorageStore[key])
  },
  get length() {
    return Object.keys(localStorageStore).length
  },
  key: (index: number) => {
    const keys = Object.keys(localStorageStore)
    return keys[index] || null
  },
} as Storage

// Socket.IO mock
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}))
