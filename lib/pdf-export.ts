interface TestResults {
  overallScore: number
  subscalePercentages: Record<string, number>
  archetype: string
  archetypeDescription: string
  strengths: string[]
  risks: string[]
  developmentSteps: string[]
}

export async function exportToPDF(results: TestResults): Promise<void> {
  try {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")])

    const startTime = Date.now()

    // Get the content element
    const element = document.getElementById("pdf-content")
    if (!element) {
      throw new Error("PDF content element not found")
    }

    // Create canvas with high quality settings
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    })

    // Calculate dimensions
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4")

    // Add header with date/time
    const now = new Date()
    const dateStr = now.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    pdf.setFontSize(10)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`Результаты теста Outcome-Mindset • ${dateStr}`, 20, 15)

    // Add main content
    let position = 25
    const imgData = canvas.toDataURL("image/jpeg", 0.8)

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 25
      pdf.addPage()
      pdf.text(`Результаты теста Outcome-Mindset • ${dateStr}`, 20, 15)
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Check generation time
    const generationTime = Date.now() - startTime
    if (generationTime > 5000) {
      console.warn(`PDF generation took ${generationTime}ms (>5s limit)`)
    }

    // Save the PDF
    const filename = `outcome-mindset-${results.overallScore}-${now.getTime()}.pdf`
    pdf.save(filename)

    // Check file size (approximate)
    const pdfSize = pdf.output("blob").size
    if (pdfSize > 1.5 * 1024 * 1024) {
      // 1.5MB
      console.warn(`PDF size ${(pdfSize / 1024 / 1024).toFixed(2)}MB exceeds 1.5MB limit`)
    }
  } catch (error) {
    console.error("PDF export failed:", error)
    throw new Error("Не удалось создать PDF. Попробуйте ещё раз.")
  }
}

export function createSimplePDF(results: TestResults): void {
  const content = `
РЕЗУЛЬТАТЫ ТЕСТА OUTCOME-MINDSET
Дата: ${new Date().toLocaleDateString("ru-RU")}

Общий балл: ${results.overallScore}/100

Архетип: ${results.archetype}
${results.archetypeDescription}

Сильные стороны:
${results.strengths.map((s) => `• ${s}`).join("\n")}

Зоны роста:
${results.risks.map((r) => `• ${r}`).join("\n")}

Рекомендации:
${results.developmentSteps.map((s) => `• ${s}`).join("\n")}
  `

  // Create downloadable text file as fallback
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `outcome-mindset-${results.overallScore}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
