"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { MailIcon, LoaderIcon, ExternalLinkIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { trackEvent } from "@/lib/analytics"

interface TestResults {
  overallScore: number
  subscalePercentages: Record<string, number>
  archetype: string
  archetypeDescription: string
  strengths: string[]
  risks: string[]
  developmentSteps: string[]
}

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  results: TestResults
}

export function EmailModal({ isOpen, onClose, results }: EmailModalProps) {
  const [email, setEmail] = useState("")
  const [includePDF, setIncludePDF] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Некорректный email",
        description: "Пожалуйста, введите действительный адрес электронной почты",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    trackEvent("email_share", { provider: "mailto", includePDF })

    try {
      // Check for email provider environment variables
      const hasEmailProvider = process.env.NEXT_PUBLIC_EMAIL_PROVIDER

      if (hasEmailProvider) {
        // TODO: Implement server-side email sending
        // This would use EmailJS/SendGrid/Mailgun based on ENV variables
        toast({
          title: "Функция в разработке",
          description: "Серверная отправка email будет доступна в следующей версии",
        })
      } else {
        // Fallback to mailto
        const subject = encodeURIComponent(`Результаты теста Outcome-Mindset (${results.overallScore} баллов)`)
        const body = encodeURIComponent(`
Привет!

Я прошёл тест на outcome-мышление и хочу поделиться результатами:

🏆 Общий балл: ${results.overallScore}/100
🎯 Архетип: ${results.archetype}

Детальные результаты:
• Результат vs Процесс: ${results.subscalePercentages.R1}%
• Метрики и пороги: ${results.subscalePercentages.R2}%
• Деньги, риск, качество: ${results.subscalePercentages.R3}%
• Stop-rule дисциплина: ${results.subscalePercentages.R5}%

${results.archetypeDescription}

${includePDF ? "📎 Для получения полного отчёта в PDF, сначала скачайте файл с результатами, затем прикрепите его к этому письму." : ""}

Попробуй и ты пройти тест: ${window.location.origin}
        `)

        const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`
        window.open(mailtoLink, "_blank")

        toast({
          title: "Почтовый клиент открыт",
          description: includePDF ? "Не забудьте прикрепить PDF-файл к письму" : "Письмо готово к отправке",
        })
      }
    } catch (error) {
      console.error("Email sharing error:", error)
      toast({
        title: "Ошибка отправки",
        description: "Попробуйте ещё раз или скопируйте результаты вручную",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MailIcon className="w-5 h-5" />
            Отправить результаты
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email адрес</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-describedby="email-help"
            />
            <p id="email-help" className="text-xs text-muted-foreground">
              Результаты будут отправлены на указанный адрес
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-pdf"
              checked={includePDF}
              onCheckedChange={(checked) => setIncludePDF(checked as boolean)}
            />
            <Label htmlFor="include-pdf" className="text-sm">
              Включить инструкцию по прикреплению PDF
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <ExternalLinkIcon className="w-4 h-4 mr-2" />
                  Отправить
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Примечание:</strong> Откроется ваш почтовый клиент с предзаполненным письмом.
          {includePDF && " Не забудьте сначала скачать PDF и прикрепить его к письму."}
        </div>
      </DialogContent>
    </Dialog>
  )
}
