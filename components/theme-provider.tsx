"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme) {
      setThemeState(savedTheme)
    }
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.remove("light", "dark")
      root.classList.add(systemTheme)
    } else {
      root.classList.remove("light", "dark")
      root.classList.add(theme)
    }
  }, [theme, mounted])

  const setTheme = React.useCallback((newTheme: Theme) => {
    localStorage.setItem("theme", newTheme)
    setThemeState(newTheme)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
