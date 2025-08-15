"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DownloadIcon, MailIcon, RefreshCwIcon, TrophyIcon, LoaderIcon } from "lucide-react"
import { calculateTestResults } from "@/lib/scoring"
import { useState, useEffect } from "react"
import { exportToPDF } from "@/lib/pdf-export"
import { EmailModal } from "@/components/email-modal"
import { useToast } from "@/hooks/use-toast"
import { trackEvent } from "@/lib/analytics"
import { sendResultsToGoogleSheets } from "@/lib/google-sheets"

interface TestAnswer {
  questionId: string
  value: any
}

interface ResultsDisplayProps {
  answers: TestAnswer[]
  onRetakeTest: () => void
  onBackToHome: () => void
}

export function ResultsDisplay({ answers, onRetakeTest, onBackToHome }: ResultsDisplayProps) {
  const results = calculateTestResults(answers)
  const [isExporting, setIsExporting] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [sheetsSent, setSheetsSent] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const sendResults = async () => {
      if (!sheetsSent) {
        const result = await sendResultsToGoogleSheets(results, answers)
        if (result.success) {
          console.log("[v0] Results successfully sent to Google Sheets")
          setSheetsSent(true)
        } else {
          console.log("[v0] Failed to send results to Google Sheets:", result.error)
        }
      }
    }

    sendResults()
  }, [sheetsSent])

  const subscaleLabels = {
    R1: "Результат vs Процесс",
    R2: "Метрики и пороги",
    R3: "Деньги, риск, качество",
    R4: "CARE-тон",
    R5: "Stop-rule дисциплина",
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getMicroExercises = () => {
    const exercises = []
    const { subscalePercentages } = results

    if (subscalePercentages.R1 < 60) {
      exercises.push({
        title: "Фокус на результатах",
        description: "Каждое утро задавайтесь вопросом: 'Какой конкретный результат я хочу получить сегодня?'",
        action: "Записывайте 1-2 ключевых результата дня",
      })
    }

    if (subscalePercentages.R2 < 60) {
      exercises.push({
        title: "Измеряйте прогресс",
        description: "Определите 2-3 ключевые метрики для своих проектов и отслеживайте их еженедельно",
        action: "Создайте простую таблицу с метриками",
      })
    }

    if (subscalePercentages.R3 < 60) {
      exercises.push({
        title: "Думайте как бизнес",
        description: "Перед принятием решений спрашивайте: 'Как это повлияет на бизнес-результаты?'",
        action: "Изучите основные бизнес-метрики компании",
      })
    }

    if (subscalePercentages.R5 < 60) {
      exercises.push({
        title: "Дисциплина решений",
        description: "Устанавливайте четкие критерии готовности перед началом работы над задачей",
        action: "Практикуйте принятие решений по таймеру",
      })
    }

    // Add general exercises if needed
    if (exercises.length < 3) {
      exercises.push({
        title: "Outcome-мышление",
        description: "Регулярно спрашивайте себя: 'Зачем я это делаю?' и 'Какой результат получит пользователь?'",
        action: "Ведите дневник результатов",
      })
    }

    return exercises.slice(0, 5)
  }

  const microExercises = getMicroExercises()

  const handleExportPDF = async () => {
    setIsExporting(true)
    trackEvent("export_pdf", { score: results.overallScore, archetype: results.archetype })

    try {
      await exportToPDF(results)
      toast({
        title: "PDF успешно создан",
        description: "Файл с результатами загружен на ваше устройство",
      })
    } catch (error) {
      console.error("PDF export error:", error)
      toast({
        title: "Ошибка создания PDF",
        description: "Попробуйте ещё раз или обратитесь в поддержку",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleEmailShare = () => {
    trackEvent("email_share", { provider: "modal_open" })
    setIsEmailModalOpen(true)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div id="pdf-content">
        {/* Overall Score */}
        <div className="text-center">
          <Card className="glass-card p-8 inline-block">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <TrophyIcon className="w-8 h-8 text-accent" />
              </div>
              <div className="text-left">
                <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
                  {results.overallScore}
                </div>
                <div className="text-muted-foreground">ваш профиль outcome-mindset</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Subscale Scores */}
        <Card className="glass-card p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Детальный профиль</h2>
          <div className="space-y-6">
            {Object.entries(subscaleLabels).map(([key, label]) => {
              const score = results.subscalePercentages[key as keyof typeof results.subscalePercentages]
              const isR4 = key === "R4"

              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{label}</span>
                    <span className={`font-semibold ${isR4 ? "text-muted-foreground" : getScoreColor(score)}`}>
                      {isR4 ? "—" : `${score}%`}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      {!isR4 && (
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(score)}`}
                          style={{ width: `${score}%` }}
                        />
                      )}
                      {isR4 && <div className="h-full bg-muted-foreground/30 rounded-full" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Archetype */}
        <Card className="glass-card p-8">
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-4 text-lg px-4 py-2">
              Ваш архетип
            </Badge>
            <h2 className="text-3xl font-bold mb-4">{results.archetype}</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">{results.archetypeDescription}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400">Сильные стороны</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {results.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <h3 className="font-semibold mb-3 text-yellow-600 dark:text-yellow-400">Зоны риска</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {results.risks.map((risk, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <h3 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">Шаги развития</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                {results.developmentSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-left">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Card>
      </div>

      {/* Micro-exercises */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-center">Как улучшить результаты</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {microExercises.map((exercise, index) => (
            <Card key={index} className="glass-card p-6 animate-apple hover-lift">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <div className="w-5 h-5 rounded bg-accent"></div>
              </div>
              <h3 className="font-semibold mb-3">{exercise.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{exercise.description}</p>
              <div className="text-xs text-accent font-medium">💡 {exercise.action}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          variant="outline"
          className="animate-apple hover-lift focus-ring bg-transparent"
          onClick={handleExportPDF}
          disabled={isExporting}
          aria-label="Скачать результаты в формате PDF"
        >
          {isExporting ? (
            <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <DownloadIcon className="w-4 h-4 mr-2" />
          )}
          {isExporting ? "Создание PDF..." : "Скачать PDF"}
        </Button>

        <Button
          variant="outline"
          className="animate-apple hover-lift focus-ring bg-transparent"
          onClick={handleEmailShare}
          aria-label="Отправить результаты по электронной почте"
        >
          <MailIcon className="w-4 h-4 mr-2" />
          Отправить на email
        </Button>

        <Button className="animate-apple hover-lift focus-ring" onClick={onRetakeTest} aria-label="Пройти тест заново">
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Пройти ещё раз
        </Button>
      </div>

      {/* Back to Home */}
      <div className="text-center pt-8">
        <Button
          variant="ghost"
          onClick={onBackToHome}
          className="animate-apple hover-lift focus-ring"
          aria-label="Вернуться на главную страницу"
        >
          Вернуться на главную
        </Button>
      </div>

      <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} results={results} />
    </div>
  )
}
