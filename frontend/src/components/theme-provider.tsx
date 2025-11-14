'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 로컬 스토리지에서 테마 설정 불러오기
    const savedTheme =
      globalThis.window === undefined ? null : (localStorage.getItem('theme') as Theme)
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const updateTheme = () => {
      let newTheme: 'light' | 'dark' = 'light'

      if (theme === 'dark') {
        newTheme = 'dark'
      } else if (theme === 'system') {
        newTheme = globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }

      setActualTheme(newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }

    updateTheme()

    // 시스템 테마 변경 감지
    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    if (globalThis.window !== undefined) {
      localStorage.setItem('theme', newTheme)
    }
  }

  const contextValue = useMemo(
    () => ({ theme, setTheme: updateTheme, actualTheme }),
    [theme, actualTheme]
  )

  // Hydration 에러 방지: 클라이언트에서만 렌더링
  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
