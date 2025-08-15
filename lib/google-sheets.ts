interface TestResultsData {
  timestamp: string
  overallScore: number
  archetype: string
  R1: number
  R2: number
  R3: number
  R4: string
  R5: number
  userAgent: string
  sessionId: string
}

export async function sendResultsToGoogleSheets(results: any, answers: any[]) {
  try {
    // Generate a simple session ID for tracking (not personally identifiable)
    const sessionId = Math.random().toString(36).substring(2, 15)

    const data: TestResultsData = {
      timestamp: new Date().toISOString(),
      overallScore: results.overallScore,
      archetype: results.archetype,
      R1: results.subscalePercentages.R1,
      R2: results.subscalePercentages.R2,
      R3: results.subscalePercentages.R3,
      R4: "—", // R4 не измеряется
      R5: results.subscalePercentages.R5,
      userAgent: navigator.userAgent.substring(0, 100), // Truncated for privacy
      sessionId: sessionId,
    }

    // Option 1: Using Google Apps Script Web App (recommended)
    const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

    if (GOOGLE_SCRIPT_URL) {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        mode: "no-cors", // Required for Google Apps Script
      })

      console.log("[v0] Results sent to Google Sheets via Apps Script")
      return { success: true, method: "apps-script" }
    }

    // Option 2: Direct API call (requires API key and more setup)
    const GOOGLE_SHEETS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
    const SPREADSHEET_ID = "1ufif-q4GymRmTCdYlXrsEsmZrWunstAyE9oS4AQ0Dao"

    if (GOOGLE_SHEETS_API_KEY) {
      const range = "Sheet1!A:H" // Adjust range as needed
      const values = [
        [
          data.timestamp,
          data.overallScore,
          data.archetype,
          data.R1,
          data.R2,
          data.R3,
          data.R4,
          data.R5,
          data.userAgent,
          data.sessionId,
        ],
      ]

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: values,
          }),
        },
      )

      if (response.ok) {
        console.log("[v0] Results sent to Google Sheets via API")
        return { success: true, method: "api" }
      }
    }

    // Fallback: Log to console for debugging
    console.log("[v0] Google Sheets integration not configured, logging results:", data)
    return { success: false, error: "No integration configured" }
  } catch (error) {
    console.error("[v0] Error sending results to Google Sheets:", error)
    return { success: false, error: error.message }
  }
}

// Google Apps Script code (to be deployed as a web app):
/*
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById('1ufif-q4GymRmTCdYlXrsEsmZrWunstAyE9oS4AQ0Dao').getActiveSheet();
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Overall Score', 'Archetype', 'R1', 'R2', 'R3', 'R4', 'R5', 'User Agent', 'Session ID'
      ]);
    }
    
    // Add the data
    sheet.appendRow([
      data.timestamp,
      data.overallScore,
      data.archetype,
      data.R1,
      data.R2,
      data.R3,
      data.R4,
      data.R5,
      data.userAgent,
      data.sessionId
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/
