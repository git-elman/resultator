"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RankingQuestionProps {
  options: string[]
  values: number[]
  onChange: (values: number[]) => void
}

export function RankingQuestion({ options, values, onChange }: RankingQuestionProps) {
  const [rankings, setRankings] = useState<number[]>(
    values.length === options.length ? values : new Array(options.length).fill(0),
  )

  const handleRankingChange = (optionIndex: number, rank: number) => {
    const newRankings = [...rankings]

    // If this rank is already assigned, swap with the current option
    const existingIndex = newRankings.findIndex((r) => r === rank)
    if (existingIndex !== -1 && existingIndex !== optionIndex) {
      newRankings[existingIndex] = newRankings[optionIndex]
    }

    newRankings[optionIndex] = rank
    setRankings(newRankings)
    onChange(newRankings)
  }

  const getRemainingCount = () => {
    const assigned = rankings.filter((r) => r >= 1 && r <= 3).length
    return Math.max(0, 3 - assigned)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Выберите 3 самых важных пункта и расставьте их по приоритету</p>
        {getRemainingCount() > 0 && (
          <Badge variant="outline" className="mt-2">
            Осталось назначить: {getRemainingCount()}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <Card
            key={index}
            className={`
              p-4 transition-all duration-200 cursor-pointer
              ${
                rankings[index] >= 1 && rankings[index] <= 3
                  ? "glass-card border-accent bg-accent/5"
                  : "border-border hover:border-accent/50 hover:bg-accent/5"
              }
              animate-apple hover-lift
            `}
          >
            <div className="flex items-center justify-between">
              <span className="flex-1 text-sm leading-relaxed pr-4">{option}</span>

              <div className="flex gap-2">
                {[1, 2, 3].map((rank) => (
                  <button
                    key={rank}
                    onClick={() => handleRankingChange(index, rank)}
                    className={`
                      w-8 h-8 rounded-lg border-2 text-sm font-semibold transition-all duration-200 focus-ring
                      ${
                        rankings[index] === rank
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border hover:border-accent/50 hover:bg-accent/10"
                      }
                      animate-apple
                    `}
                    aria-label={`Назначить приоритет ${rank} для "${option}"`}
                  >
                    {rank}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
