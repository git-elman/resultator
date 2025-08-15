type EventName =
  | "test_start"
  | "question_view"
  | "answer_select"
  | "rank_change"
  | "likert_change"
  | "test_complete"
  | "export_pdf"
  | "email_share"

interface EventData {
  [key: string]: any
}

// Analytics provider configuration
const ANALYTICS_PROVIDER = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || "console"

export function trackEvent(eventName: EventName, data: EventData = {}) {
  const eventPayload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...data,
    // Remove any PII - only aggregate data
    sessionId: getSessionId(),
  }

  switch (ANALYTICS_PROVIDER) {
    case "console":
      console.log("📊 Analytics Event:", eventPayload)
      break

    case "gtag":
      if (typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("event", eventName, {
          custom_parameter: JSON.stringify(data),
          event_category: "outcome_mindset_test",
        })
      }
      break

    case "mixpanel":
      if (typeof window !== "undefined" && (window as any).mixpanel) {
        ;(window as any).mixpanel.track(eventName, eventPayload)
      }
      break

    default:
      // Fallback to console
      console.log("📊 Analytics Event:", eventPayload)
  }
}

// Generate or retrieve session ID (no PII)
function getSessionId(): string {
  if (typeof window === "undefined") return "server"

  let sessionId = sessionStorage.getItem("outcome_test_session")
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem("outcome_test_session", sessionId)
  }
  return sessionId
}

// Helper functions for specific events
export const analytics = {
  testStart: () => trackEvent("test_start"),

  questionView: (questionId: string) => trackEvent("question_view", { id: questionId }),

  answerSelect: (questionId: string, choice: any) => trackEvent("answer_select", { id: questionId, choice }),

  rankChange: (questionId: string, item: string, rank: number) =>
    trackEvent("rank_change", { id: questionId, item, rank }),

  likertChange: (questionId: string, value: number) => trackEvent("likert_change", { id: questionId, value }),

  testComplete: (score: number, subscales: Record<string, number>, archetype: string) =>
    trackEvent("test_complete", { score, ...subscales, archetype }),

  exportPdf: (score: number, archetype: string) => trackEvent("export_pdf", { score, archetype }),

  emailShare: (provider: string, includePdf?: boolean) => trackEvent("email_share", { provider, includePdf }),
}
