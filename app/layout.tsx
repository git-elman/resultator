import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Outcome-Based Mindset Assessment",
  description: "Измерьте свой outcome-based mindset с помощью научно обоснованного теста",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, ${inter.style.fontFamily}, sans-serif;
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, var(--font-inter), sans-serif;
}
        `}</style>
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
