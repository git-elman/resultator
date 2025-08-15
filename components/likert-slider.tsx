"use client"

import type React from "react"

import { useState } from "react"

interface LikertSliderProps {
  value: number
  onChange: (value: number) => void
}

export function LikertSlider({ value, onChange }: LikertSliderProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const labels = ["Полностью не согласен", "Скорее не согласен", "Нейтрально", "Скорее согласен", "Полностью согласен"]

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "ArrowLeft" && index > 0) {
      onChange(index)
      setFocusedIndex(index - 1)
    } else if (event.key === "ArrowRight" && index < 4) {
      onChange(index + 2)
      setFocusedIndex(index + 1)
    } else if (event.key === "Enter" || event.key === " ") {
      onChange(index + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-sm text-muted-foreground mb-4">
        <span>1 — Полностью противоречит</span>
        <span>5 — Полностью совпадает</span>
      </div>

      <div className="flex gap-2" role="radiogroup" aria-label="Оценка по шкале от 1 до 5">
        {[1, 2, 3, 4, 5].map((score, index) => (
          <button
            key={score}
            role="radio"
            aria-checked={value === score}
            aria-label={`${score} - ${labels[index]}`}
            tabIndex={focusedIndex === index ? 0 : -1}
            className={`
              flex-1 p-4 rounded-xl border-2 transition-all duration-200 focus-ring
              ${
                value === score
                  ? "border-accent bg-accent/10 text-accent-foreground"
                  : "border-border hover:border-accent/50 hover:bg-accent/5"
              }
              animate-apple hover-lift
            `}
            onClick={() => onChange(score)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">{score}</div>
              <div className="text-xs text-muted-foreground leading-tight">{labels[index]}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
