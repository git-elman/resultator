"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { LikertSlider } from "./likert-slider"
import { RankingQuestion } from "./ranking-question"
import { ChoiceCards } from "./choice-cards"
import { analytics } from "@/lib/analytics"

interface TestAnswer {
  questionId: string
  value: any
}

interface Question {
  id: string
  type: "likert" | "ranking" | "single-choice" | "multi-choice"
  title: string
  content: string
  options?: string[]
  explanation: string
}

const questions: Question[] = [
  {
    id: "B1",
    type: "likert",
    title: "Вопрос 1 из 10",
    content:
      "Главная цель моей работы — постоянное улучшение результатов, которые получают пользователи/клиенты/коллеги",
    explanation: "Этот вопрос измеряет фокус на результатах vs процессах — ключевой индикатор outcome-based мышления",
  },
  {
    id: "B2",
    type: "ranking",
    title: "Вопрос 2 из 10",
    content: "Расставьте по важности (1-3) элементы отчёта о проделанной работе:",
    options: [
      "Какие ресурсы потратили",
      "Какие шаги выполнили",
      "Какие новые инструменты освоили",
      "Как изменились ключевые метрики / что готово к использованию",
      "Насколько быстро работали vs план",
    ],
    explanation: "Приоритизация метрик результата показывает зрелость outcome-based подхода",
  },
  {
    id: "B3",
    type: "single-choice",
    title: "Вопрос 3 из 10",
    content: "Вы просите +3 дня к согласованному сроку. Это признак:",
    options: ["Профессионализма — лучше сделать качественно", "Низкой продуктивности — надо было планировать лучше"],
    explanation: "Отношение к срокам отражает понимание дисциплины и планирования",
  },
  {
    id: "B4",
    type: "single-choice",
    title: "Вопрос 4 из 10",
    content: "Срок сегодня, но помешали обстоятельства. Вы:",
    options: [
      "Переносите срок",
      "Отправляете готовое + называете срок доработки",
      "Дожимаете любой ценой, даже если пострадает качество",
    ],
    explanation: "Реакция на форс-мажор показывает баланс между качеством и обязательствами",
  },
  {
    id: "B5",
    type: "multi-choice",
    title: "Вопрос 5 из 10",
    content: "Выберите профессии, где главное — конечный результат для пользователя:",
    options: [
      "Дизайнер — создать фирменный стиль",
      "Хирург — качественно прооперированный пациент",
      "Руководитель отдела продаж — повысить продажи",
      "Копирайтер — опубликованный текст",
      "Маркетолог — проверить гипотезы",
      "HR — нанять сотрудников",
    ],
    explanation: "Понимание outcome vs output в разных профессиях",
  },
  {
    id: "B6",
    type: "ranking",
    title: "Вопрос 6 из 10",
    content: "Расставьте по важности (1-3) вопросы при получении новой задачи:",
    options: [
      "В какие сроки нужно уложиться?",
      "Как мы поймём, что результат достигнут?",
      "Какие есть ограничения?",
      "Какой ключевой результат должен получиться?",
      "Какие действия нужно выполнить?",
      "Какие инструменты использовать?",
      "По каким критериям будем оценивать готовность?",
    ],
    explanation: "Приоритеты при планировании отражают outcome-ориентированность",
  },
  {
    id: "B7",
    type: "single-choice",
    title: "Вопрос 7 из 10",
    content: "Договорились на 1 логотип к понедельнику. Принесли 4 варианта. Это хорошо?",
    options: ["Да, показывает старание", "Нет, это неэффективно"],
    explanation: "Отношение к перевыполнению показывает понимание эффективности",
  },
  {
    id: "B8",
    type: "single-choice",
    title: "Вопрос 8 из 10",
    content: "Настраиваете Telegram-каналы в рамках бюджета. Что важнее всего?",
    options: [
      "Получить заявки с допустимым CPA",
      "Охватить максимум подписчиков",
      "Получить высокий engagement",
      "Опубликовать качественный контент",
    ],
    explanation: "Приоритизация бизнес-метрик vs vanity metrics",
  },
  {
    id: "B9",
    type: "ranking",
    title: "Вопрос 9 из 10",
    content: "Расставьте по важности (1-3) аспекты при создании ролика с шеф-поваром:",
    options: [
      "Зачем делаем ролик и какой эффект ожидаем?",
      "Кто целевая аудитория?",
      "В какие сроки нужно уложиться?",
      "Сколько охватов планируем?",
      "На какой площадке будем публиковать?",
      "Какие технические рекомендации по съёмке?",
    ],
    explanation: "Планирование контента: цель vs исполнение",
  },
  {
    id: "B10",
    type: "single-choice",
    title: "Вопрос 10 из 10",
    content: "Что важнее всего при создании обложки бестселлера?",
    options: [
      "Красивая типографика",
      "Яркие цвета",
      "Соответствие жанру",
      "Узнаваемость автора",
      "Всё вместе: привлечь внимание + передать суть + выделиться среди конкурентов",
    ],
    explanation: "Комплексное мышление vs фокус на отдельных элементах",
  },
]

interface TestInterfaceProps {
  onComplete: (answers: TestAnswer[]) => void
  onBack: () => void
}

export function TestInterface({ onComplete, onBack }: TestInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<TestAnswer[]>([])

  useEffect(() => {
    analytics.testStart()
  }, [])

  useEffect(() => {
    analytics.questionView(questions[currentQuestion].id)
  }, [currentQuestion])

  useEffect(() => {
    const saved = localStorage.getItem("outcome-test-progress")
    if (saved) {
      const { currentQuestion: savedQuestion, answers: savedAnswers } = JSON.parse(saved)
      setCurrentQuestion(savedQuestion)
      setAnswers(savedAnswers)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "outcome-test-progress",
      JSON.stringify({
        currentQuestion,
        answers,
      }),
    )
  }, [currentQuestion, answers])

  const question = questions[currentQuestion]
  const currentAnswer = answers.find((a) => a.questionId === question.id)
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (value: any) => {
    const newAnswers = answers.filter((a) => a.questionId !== question.id)
    newAnswers.push({ questionId: question.id, value })
    setAnswers(newAnswers)

    if (question.type === "ranking") {
      if (Array.isArray(value)) {
        value.forEach((rank: number, index: number) => {
          if (rank > 0 && rank <= 3) {
            analytics.rankChange(question.id, question.options?.[index] || `option_${index}`, rank)
          }
        })
      }
    } else if (question.type === "likert") {
      analytics.likertChange(question.id, value)
    } else {
      analytics.answerSelect(question.id, value)
    }
  }

  const canProceed = () => {
    if (!currentAnswer) return false

    if (question.type === "ranking") {
      const rankings = currentAnswer.value as number[]
      const rankedItems = rankings.filter((r) => r >= 1 && r <= 3)
      const uniqueRanks = new Set(rankedItems)
      return rankedItems.length === 3 && uniqueRanks.size === 3
    }

    if (question.type === "multi-choice") {
      return Array.isArray(currentAnswer.value) && currentAnswer.value.length > 0
    }

    return currentAnswer.value !== undefined && currentAnswer.value !== null
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      analytics.testComplete(0, {}, "Unknown")

      localStorage.removeItem("outcome-test-progress")
      onComplete(answers)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else {
      onBack()
    }
  }

  const renderQuestion = () => {
    switch (question.type) {
      case "likert":
        return <LikertSlider value={currentAnswer?.value || 3} onChange={handleAnswer} />
      case "ranking":
        return (
          <RankingQuestion
            options={question.options || []}
            values={currentAnswer?.value || []}
            onChange={handleAnswer}
          />
        )
      case "single-choice":
        return (
          <ChoiceCards
            options={question.options || []}
            value={currentAnswer?.value}
            onChange={handleAnswer}
            multiple={false}
          />
        )
      case "multi-choice":
        return (
          <ChoiceCards
            options={question.options || []}
            value={currentAnswer?.value || []}
            onChange={handleAnswer}
            multiple={true}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div
          className="progress-bar mb-4"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Прогресс теста: ${Math.round(progress)}%`}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Прогресс: {currentQuestion + 1} из {questions.length}
          </span>
          <span>~{Math.max(1, Math.ceil((questions.length - currentQuestion - 1) * 0.8))} мин осталось</span>
        </div>
      </div>

      <Card className="glass-card p-8">
        <div className="mb-8">
          <Badge variant="outline" className="mb-4">
            {question.title}
          </Badge>
          <h2 className="text-2xl font-semibold mb-6 leading-relaxed">{question.content}</h2>
        </div>

        <div className="mb-8" role="group" aria-labelledby="question-content">
          {renderQuestion()}
        </div>

        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="animate-apple hover-lift focus-ring bg-transparent"
            aria-label={currentQuestion === 0 ? "Вернуться к главной странице" : "Вернуться к предыдущему вопросу"}
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" aria-hidden="true" />
            {currentQuestion === 0 ? "К главной" : "Назад"}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="animate-apple hover-lift focus-ring"
            aria-label={
              currentQuestion === questions.length - 1
                ? "Завершить тест и посмотреть результаты"
                : "Перейти к следующему вопросу"
            }
            aria-describedby={!canProceed() ? "answer-required" : undefined}
          >
            {currentQuestion === questions.length - 1 ? "Завершить тест" : "Далее"}
            <ChevronRightIcon className="w-4 h-4 ml-2" aria-hidden="true" />
          </Button>
        </div>

        {!canProceed() && (
          <p id="answer-required" className="sr-only">
            Пожалуйста, выберите ответ перед продолжением
          </p>
        )}
      </Card>
    </div>
  )
}
