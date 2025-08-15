"use client"

import { Card } from "@/components/ui/card"
import { CheckIcon } from "lucide-react"

interface ChoiceCardsProps {
  options: string[]
  value: any
  onChange: (value: any) => void
  multiple: boolean
}

export function ChoiceCards({ options, value, onChange, multiple }: ChoiceCardsProps) {
  const handleSelect = (optionIndex: number) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(optionIndex)
        ? currentValues.filter((v) => v !== optionIndex)
        : [...currentValues, optionIndex]
      onChange(newValues)
    } else {
      onChange(optionIndex)
    }
  }

  const isSelected = (optionIndex: number) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionIndex)
    }
    return value === optionIndex
  }

  return (
    <div className="space-y-4">
      {multiple && <p className="text-sm text-muted-foreground text-center mb-6">Выберите все подходящие варианты</p>}

      <div className="space-y-3">
        {options.map((option, index) => (
          <Card
            key={index}
            className={`
              p-6 cursor-pointer transition-all duration-200 group
              ${
                isSelected(index)
                  ? "glass-card border-accent bg-accent/10"
                  : "border-border hover:border-accent/50 hover:bg-accent/5"
              }
              animate-apple hover-lift
            `}
            onClick={() => handleSelect(index)}
          >
            <div className="flex items-center gap-4">
              <div
                className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${
                  isSelected(index)
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border group-hover:border-accent/50"
                }
              `}
              >
                {isSelected(index) && <CheckIcon className="w-4 h-4" />}
              </div>

              <span className="flex-1 leading-relaxed">{option}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
