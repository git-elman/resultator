"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { MoonIcon, SunIcon, ChevronDownIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TestInterface } from "@/components/test-interface"
import { ResultsDisplay } from "@/components/results-display"
import { trackEvent } from "@/lib/analytics" // Fixed import path from utils to lib

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const [currentStep, setCurrentStep] = useState<"landing" | "test" | "results">("landing")
  const [testAnswers, setTestAnswers] = useState<any[]>([])

  const handleTestComplete = (answers: any[]) => {
    setTestAnswers(answers)
    setCurrentStep("results")
  }

  const handleRetakeTest = () => {
    trackEvent("test_start") // Added analytics tracking for retake
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("outcome-test-progress")
    }
    setTestAnswers([])
    setCurrentStep("test")
  }

  const handleBackToHome = () => {
    setCurrentStep("landing")
  }

  const handleStartTest = () => {
    trackEvent("test_start")
    setCurrentStep("test")
  }

  const faqItems = [
    {
      question: "Сколько времени занимает прохождение теста?",
      answer:
        "Тест состоит из 10 вопросов и занимает примерно 7-10 минут. Вы можете проходить его в удобном темпе, прогресс автоматически сохраняется.",
    },
    {
      question: "Что такое outcome-based mindset?",
      answer:
        "Это тип мышления, ориентированный на достижение конкретных результатов, а не на выполнение процессов. Такой подход помогает фокусироваться на том, что действительно важно для бизнеса и пользователей.",
    },
    {
      question: "Как интерпретировать результаты теста?",
      answer:
        "Вы получите оценку по 5 подшкалам (R1-R5), общий балл от 0 до 100, определение вашего архетипа из 12 возможных и персональные рекомендации для развития.",
    },
    {
      question: "Можно ли пройти тест повторно?",
      answer:
        "Да, вы можете проходить тест сколько угодно раз. Рекомендуется повторное прохождение через 3-6 месяцев для отслеживания прогресса в развитии мышления.",
    },
    {
      question: "На чем основана методология теста?",
      answer:
        "Тест основан на концепции Jobs-to-be-Done (JTBD) и исследованиях outcome-based мышления. Методология разработана для оценки способности фокусироваться на результатах в профессиональной деятельности.",
    },
    {
      question: "Сохраняются ли мои данные?",
      answer:
        "Все данные сохраняются локально в вашем браузере. Мы не собираем персональную информацию и не передаем данные третьим лицам.",
    },
  ]

  if (currentStep === "test") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-semibold text-sm">OM</span>
              </div>
              <span className="font-semibold text-foreground">Outcome Mindset</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="animate-apple hover-lift focus-ring"
            >
              <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Переключить тему</span>
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <TestInterface onComplete={handleTestComplete} onBack={() => setCurrentStep("landing")} />
        </main>
      </div>
    )
  }

  if (currentStep === "results") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-semibold text-sm">OM</span>
              </div>
              <span className="font-semibold text-foreground">Outcome Mindset</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="animate-apple hover-lift focus-ring"
            >
              <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Переключить тему</span>
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <ResultsDisplay answers={testAnswers} onRetakeTest={handleRetakeTest} onBackToHome={handleBackToHome} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-semibold text-sm">OM</span>
            </div>
            <span className="font-semibold text-foreground">Outcome Mindset</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="animate-apple hover-lift focus-ring"
          >
            <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Переключить тему</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="text-center rhythm-24 mb-20">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 animate-apple">
              JTBD + outcome-mindset
            </Badge>

            <h1 className="text-hero mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Измерьте свой outcome-based mindset
            </h1>

            <p className="text-section text-muted-foreground mb-8 max-w-2xl mx-auto">
              Научно обоснованный тест из 10 вопросов поможет определить ваш профиль мышления, архетип и получить
              персональные рекомендации для развития
            </p>

            <Button
              size="lg"
              className="animate-apple hover-lift focus-ring text-lg px-8 py-6 rounded-2xl"
              onClick={handleStartTest}
            >
              Пройти тест (10 мин)
            </Button>
          </div>
        </section>

        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-hero-sm mb-4">О тесте</h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              Тест измеряет 5 ключевых подшкал outcome-based мышления и определяет ваш архетип
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "R1: Результат vs Процесс",
                description: "Фокус на конечных результатах, а не на выполнении процедур",
              },
              {
                title: "R2: Метрики и пороги",
                description: "Использование измеримых показателей для оценки успеха",
              },
              {
                title: "R3: Деньги, риск, качество",
                description: "Понимание бизнес-контекста и принятие взвешенных решений",
              },
              {
                title: "R4: CARE-тон",
                description: "Эмпатичное отношение к пользователям и коллегам",
              },
              {
                title: "R5: Stop-rule дисциплина",
                description: "Умение вовремя остановиться и принять решение",
              },
            ].map((item, index) => (
              <Card key={index} className="glass-card p-6 animate-apple hover-lift">
                <h3 className="font-semibold mb-3 text-card-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-hero-sm mb-4">Часто задаваемые вопросы</h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              Ответы на популярные вопросы о тесте и методологии
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger asChild>
                  <Card className="glass-card p-6 animate-apple hover-lift cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-left text-card-foreground group-hover:text-accent-foreground transition-colors">
                        {item.question}
                      </h3>
                      <ChevronDownIcon className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground transition-all group-data-[state=open]:rotate-180" />
                    </div>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-4">
                  <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-hero-sm mb-4">Что вы получите</h2>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              Подробный анализ вашего мышления с практическими рекомендациями
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card p-8 animate-apple hover-lift">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <div className="w-6 h-6 rounded bg-accent"></div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Общий балл и профиль</h3>
              <p className="text-muted-foreground leading-relaxed">
                Получите оценку от 0 до 100 баллов и детальный анализ по каждой из 5 подшкал outcome-based мышления
              </p>
            </Card>

            <Card className="glass-card p-8 animate-apple hover-lift">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <div className="w-6 h-6 rounded bg-accent"></div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Архетип из 12</h3>
              <p className="text-muted-foreground leading-relaxed">
                Узнайте свой уникальный архетип: от "Кросс-функционального интегратора" до "Процессного стахановца"
              </p>
            </Card>

            <Card className="glass-card p-8 animate-apple hover-lift">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <div className="w-6 h-6 rounded bg-accent"></div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Персональные рекомендации</h3>
              <p className="text-muted-foreground leading-relaxed">
                Получите конкретные шаги для развития слабых сторон и усиления сильных качеств вашего мышления
              </p>
            </Card>

            <Card className="glass-card p-8 animate-apple hover-lift">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <div className="w-6 h-6 rounded bg-accent"></div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Микро-упражнения</h3>
              <p className="text-muted-foreground leading-relaxed">
                Практические упражнения для ежедневного применения и постепенного развития outcome-based подхода
              </p>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground font-semibold text-sm">OM</span>
                </div>
                <span className="font-semibold text-foreground">Outcome Mindset</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Научно обоснованная оценка outcome-based мышления для профессионального развития
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">О методологии</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Jobs-to-be-Done подход</li>
                <li>5 ключевых подшкал</li>
                <li>12 архетипов мышления</li>
                <li>Персонализированные рекомендации</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Конфиденциальность</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Локальное хранение данных</li>
                <li>Без сбора персональной информации</li>
                <li>Без передачи третьим лицам</li>
                <li>Полная анонимность</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">© 2024 Outcome Mindset Assessment. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
