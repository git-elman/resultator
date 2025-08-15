interface TestAnswer {
  questionId: string
  value: any
}

interface SubscaleScores {
  R1: number
  R2: number
  R3: number
  R4: number // Always 0, not measured
  R5: number
}

interface TestResults {
  overallScore: number
  subscaleScores: SubscaleScores
  subscalePercentages: SubscaleScores
  archetype: string
  archetypeDescription: string
  strengths: string[]
  risks: string[]
  developmentSteps: string[]
}

// Maximum possible scores for each subscale
const MAX_SCORES = {
  R1: 0, // Will be calculated dynamically
  R2: 0, // Will be calculated dynamically
  R3: 0, // Will be calculated dynamically
  R4: 0, // Not measured
  R5: 0, // Will be calculated dynamically
}

// Correct answers for multi-choice and single-choice questions
const CORRECT_ANSWERS = {
  B3: 0, // A = профессионализм
  B4: 1, // B = отправляете готовое + срок доработки
  B5: [1, 3], // Хирург и Копирайтер (indices 1 and 3)
  B7: 1, // B = нет, неэффективно
  B8: 0, // A = заявки с допустимым CPA
  B10: 4, // E = всё вместе
}

// Ranking question ideal answers
const RANKING_IDEALS = {
  B2: [1, 2, 1, 3, 2], // важность для каждого из 5 пунктов
  B6: [3, 3, 2, 3, 1, 1, 3], // важность для каждого из 7 пунктов
  B9: [3, 3, 3, 2, 1, 1], // важность для каждого из 6 пунктов
}

export function calculateTestResults(answers: TestAnswer[]): TestResults {
  const subscaleScores: SubscaleScores = { R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 }
  const maxScores: SubscaleScores = { R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 }

  // Process each answer
  answers.forEach((answer) => {
    const { questionId, value } = answer

    switch (questionId) {
      case "B1":
        // Likert 1→0, 2→1, 3→2, 4→3, 5→4
        const b1Score = Math.max(0, (value as number) - 1)
        subscaleScores.R1 += b1Score
        maxScores.R1 += 4
        break

      case "B2":
        // Ranking question with 5 options
        const b2Score = calculateRankingScore(value as number[], RANKING_IDEALS.B2)
        const b2Normalized = (b2Score / 5) * 4 // Normalize to 0-4
        subscaleScores.R1 += b2Normalized * 0.7 // 70% to R1
        subscaleScores.R2 += b2Normalized * 0.3 // 30% to R2
        maxScores.R1 += 4 * 0.7
        maxScores.R2 += 4 * 0.3
        break

      case "B3":
        // Single choice: A=2 (R5), B=0
        const b3Score = value === CORRECT_ANSWERS.B3 ? 2 : 0
        subscaleScores.R5 += b3Score
        maxScores.R5 += 2
        break

      case "B4":
        // Single choice: B=2 (R5), A=1, C=0
        let b4Score = 0
        if (value === 1)
          b4Score = 2 // B
        else if (value === 0)
          b4Score = 1 // A
        else b4Score = 0 // C
        subscaleScores.R5 += b4Score
        maxScores.R5 += 2
        break

      case "B5":
        // Multi-choice: 2 correct answers (+1 each), wrong answers (-0.5, min 0)
        const selectedOptions = value as number[]
        const correctAnswers = CORRECT_ANSWERS.B5
        let b5Score = 0

        // Add points for correct answers
        correctAnswers.forEach((correctIndex) => {
          if (selectedOptions.includes(correctIndex)) {
            b5Score += 1
          }
        })

        // Subtract points for wrong answers
        selectedOptions.forEach((selectedIndex) => {
          if (!correctAnswers.includes(selectedIndex)) {
            b5Score -= 0.5
          }
        })

        b5Score = Math.max(0, Math.min(2, b5Score)) // Clamp between 0 and 2
        subscaleScores.R1 += b5Score
        maxScores.R1 += 2
        break

      case "B6":
        // Ranking question with 7 options
        const b6Score = calculateRankingScore(value as number[], RANKING_IDEALS.B6)
        const b6Normalized = (b6Score / 7) * 4 // Normalize to 0-4
        subscaleScores.R1 += b6Normalized * 0.4 // 40% to R1
        subscaleScores.R2 += b6Normalized * 0.4 // 40% to R2
        subscaleScores.R3 += b6Normalized * 0.2 // 20% to R3
        maxScores.R1 += 4 * 0.4
        maxScores.R2 += 4 * 0.4
        maxScores.R3 += 4 * 0.2
        break

      case "B7":
        // Single choice: B=2 (split between R1 and R5)
        const b7Score = value === CORRECT_ANSWERS.B7 ? 2 : 0
        subscaleScores.R1 += b7Score * 0.5 // 50% to R1
        subscaleScores.R5 += b7Score * 0.5 // 50% to R5
        maxScores.R1 += 2 * 0.5
        maxScores.R5 += 2 * 0.5
        break

      case "B8":
        // Single choice: A=2 (R3)
        const b8Score = value === CORRECT_ANSWERS.B8 ? 2 : 0
        subscaleScores.R3 += b8Score
        maxScores.R3 += 2
        break

      case "B9":
        // Ranking question with 6 options
        const b9Score = calculateRankingScore(value as number[], RANKING_IDEALS.B9)
        const b9Normalized = (b9Score / 6) * 4 // Normalize to 0-4
        subscaleScores.R1 += b9Normalized * 0.5 // 50% to R1
        subscaleScores.R3 += b9Normalized * 0.5 // 50% to R3
        maxScores.R1 += 4 * 0.5
        maxScores.R3 += 4 * 0.5
        break

      case "B10":
        // Single choice: E=2 (split 40% R1 / 30% R2 / 30% R3)
        const b10Score = value === CORRECT_ANSWERS.B10 ? 2 : 0
        subscaleScores.R1 += b10Score * 0.4 // 40% to R1
        subscaleScores.R2 += b10Score * 0.3 // 30% to R2
        subscaleScores.R3 += b10Score * 0.3 // 30% to R3
        maxScores.R1 += 2 * 0.4
        maxScores.R2 += 2 * 0.3
        maxScores.R3 += 2 * 0.3
        break
    }
  })

  // Calculate percentages for each subscale
  const subscalePercentages: SubscaleScores = {
    R1: maxScores.R1 > 0 ? Math.round((subscaleScores.R1 / maxScores.R1) * 100) : 0,
    R2: maxScores.R2 > 0 ? Math.round((subscaleScores.R2 / maxScores.R2) * 100) : 0,
    R3: maxScores.R3 > 0 ? Math.round((subscaleScores.R3 / maxScores.R3) * 100) : 0,
    R4: 0, // Not measured
    R5: maxScores.R5 > 0 ? Math.round((subscaleScores.R5 / maxScores.R5) * 100) : 0,
  }

  // Calculate overall score
  const totalScore = subscaleScores.R1 + subscaleScores.R2 + subscaleScores.R3 + subscaleScores.R5
  const totalMaxScore = maxScores.R1 + maxScores.R2 + maxScores.R3 + maxScores.R5
  const overallScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0

  // Determine archetype
  const archetype = determineArchetype(subscalePercentages)

  return {
    overallScore,
    subscaleScores,
    subscalePercentages,
    archetype: archetype.name,
    archetypeDescription: archetype.description,
    strengths: archetype.strengths,
    risks: archetype.risks,
    developmentSteps: archetype.developmentSteps,
  }
}

function calculateRankingScore(userRankings: number[], idealWeights: number[]): number {
  let score = 0

  for (let i = 0; i < userRankings.length && i < idealWeights.length; i++) {
    const userRank = userRankings[i]
    const idealWeight = idealWeights[i]

    if (userRank === idealWeight) {
      score += 1 // Perfect match
    } else if (Math.abs(userRank - idealWeight) === 1) {
      score += 0.5 // Close match (±1)
    }
    // No points for larger differences
  }

  return score
}

interface Archetype {
  name: string
  description: string
  strengths: string[]
  risks: string[]
  developmentSteps: string[]
}

function determineArchetype(scores: SubscaleScores): Archetype {
  const { R1, R2, R3, R5 } = scores

  // Apply archetype rules from specification
  if (R1 >= 70 && R2 >= 70 && R3 >= 70 && R5 >= 60) {
    return {
      name: "Кросс-функциональный интегратор",
      description:
        "Вы мастерски балансируете результаты, метрики, бизнес-контекст и дисциплину. Способны видеть полную картину и принимать взвешенные решения.",
      strengths: ["Системное мышление", "Баланс всех аспектов", "Стратегическое планирование"],
      risks: ["Возможная медлительность", "Перфекционизм", "Сложность делегирования"],
      developmentSteps: [
        "Развивайте скорость принятия решений",
        "Учитесь делегировать детали",
        "Фокусируйтесь на ключевых метриках",
      ],
    }
  }

  if (R1 < 40 && R2 < 40 && R3 < 40) {
    return {
      name: "Процессный стахановец",
      description:
        "Вы фокусируетесь на качественном выполнении процессов, но можете упускать конечные результаты и бизнес-контекст.",
      strengths: ["Качество исполнения", "Следование процедурам", "Надежность"],
      risks: ["Потеря фокуса на результатах", "Игнорирование метрик", "Недооценка бизнес-контекста"],
      developmentSteps: [
        "Изучайте ключевые метрики бизнеса",
        "Связывайте свою работу с результатами",
        "Задавайтесь вопросом 'зачем?' чаще",
      ],
    }
  }

  if (R1 >= 70 && R2 < 50 && R3 >= 70) {
    return {
      name: "Бизнес-драйвер",
      description:
        "Вы отлично понимаете бизнес-контекст и фокусируетесь на результатах, но можете недооценивать важность метрик.",
      strengths: ["Бизнес-мышление", "Фокус на результатах", "Понимание рисков"],
      risks: ["Недостаток измерений", "Интуитивные решения", "Сложность масштабирования"],
      developmentSteps: ["Внедряйте систему метрик", "Изучайте аналитику", "Документируйте успешные практики"],
    }
  }

  if (R1 >= 70 && R2 >= 70 && R3 < 50) {
    return {
      name: "Инженер результата",
      description:
        "Вы мастерски работаете с результатами и метриками, но можете недооценивать бизнес-риски и ограничения.",
      strengths: ["Измеримые результаты", "Аналитическое мышление", "Оптимизация процессов"],
      risks: ["Игнорирование бизнес-контекста", "Недооценка рисков", "Фокус на локальной оптимизации"],
      developmentSteps: [
        "Изучайте бизнес-модель компании",
        "Учитывайте финансовые ограничения",
        "Консультируйтесь с бизнес-командой",
      ],
    }
  }

  if (R1 >= 70 && R2 < 50 && R3 < 50) {
    return {
      name: "Целе-романтик",
      description: "Вы отлично фокусируетесь на результатах, но можете упускать важность измерений и бизнес-контекста.",
      strengths: ["Ясность целей", "Мотивация команды", "Видение результата"],
      risks: ["Отсутствие измерений", "Игнорирование ограничений", "Переоценка возможностей"],
      developmentSteps: [
        "Внедрите систему измерений",
        "Изучите бизнес-ограничения",
        "Разбивайте цели на измеримые этапы",
      ],
    }
  }

  if (R1 < 50 && R2 >= 70 && R3 < 50) {
    return {
      name: "Метрик-коллекционер",
      description: "Вы отлично работаете с данными и метриками, но можете терять фокус на конечных результатах.",
      strengths: ["Аналитические навыки", "Точность измерений", "Выявление паттернов"],
      risks: ["Потеря фокуса на результатах", "Паралич анализа", "Метрики ради метрик"],
      developmentSteps: [
        "Связывайте метрики с бизнес-результатами",
        "Фокусируйтесь на ключевых показателях",
        "Принимайте решения на основе данных",
      ],
    }
  }

  if (R5 < 50 && (R1 + R2 + R3) / 3 >= 50) {
    return {
      name: "Экспериментатор без стоп-правил",
      description:
        "Вы хорошо понимаете результаты и контекст, но можете испытывать сложности с принятием окончательных решений.",
      strengths: ["Открытость к экспериментам", "Гибкость мышления", "Поиск лучших решений"],
      risks: ["Бесконечные итерации", "Пропуск дедлайнов", "Неопределенность для команды"],
      developmentSteps: [
        "Устанавливайте четкие критерии готовности",
        "Практикуйте принятие решений в условиях неопределенности",
        "Внедрите time-boxing",
      ],
    }
  }

  if (R3 >= 70 && (R1 + R2) / 2 < 70) {
    return {
      name: "Риск-сейфер",
      description:
        "Вы отлично понимаете бизнес-контекст и риски, но можете быть слишком осторожными в достижении результатов.",
      strengths: ["Управление рисками", "Бизнес-мышление", "Предотвращение ошибок"],
      risks: ["Излишняя осторожность", "Медленное принятие решений", "Упущенные возможности"],
      developmentSteps: [
        "Балансируйте риски и возможности",
        "Практикуйте быстрое прототипирование",
        "Изучайте lean-подходы",
      ],
    }
  }

  if (R1 >= 60 && R1 <= 70 && R2 >= 60 && R2 <= 70 && R3 >= 60 && R3 <= 70) {
    return {
      name: "Системный практик",
      description:
        "Вы демонстрируете сбалансированный подход ко всем аспектам outcome-based мышления с хорошим потенциалом роста.",
      strengths: ["Сбалансированный подход", "Системное видение", "Потенциал развития"],
      risks: ["Недостаток экспертизы в отдельных областях", "Размытый фокус", "Средний уровень во всем"],
      developmentSteps: [
        "Выберите 1-2 области для углубления",
        "Развивайте экспертизу постепенно",
        "Ищите ментора в сильных областях",
      ],
    }
  }

  // Additional archetypes to reach 12 total
  if (R1 >= 60 && R5 >= 70 && R2 < 60 && R3 < 60) {
    return {
      name: "Дисциплинированный исполнитель",
      description:
        "Вы сочетаете фокус на результатах с высокой дисциплиной, но можете упускать аналитику и бизнес-контекст.",
      strengths: ["Дисциплина выполнения", "Соблюдение сроков", "Фокус на результатах"],
      risks: ["Недостаток аналитики", "Игнорирование бизнес-контекста", "Жесткость подхода"],
      developmentSteps: ["Изучайте ключевые метрики", "Развивайте бизнес-мышление", "Добавляйте гибкости в процессы"],
    }
  }

  if (R2 >= 70 && R3 >= 70 && R1 < 60 && R5 < 60) {
    return {
      name: "Аналитик-консультант",
      description: "Вы отлично работаете с данными и понимаете бизнес, но можете терять фокус на конечных результатах.",
      strengths: ["Глубокая аналитика", "Бизнес-консультирование", "Стратегическое мышление"],
      risks: ["Потеря фокуса на результатах", "Медленное принятие решений", "Переоценка анализа"],
      developmentSteps: [
        "Связывайте анализ с действиями",
        "Фокусируйтесь на ключевых результатах",
        "Практикуйте быстрое принятие решений",
      ],
    }
  }

  // Default archetype
  return {
    name: "Развивающийся практик",
    description:
      "Вы находитесь в процессе развития outcome-based мышления. У вас есть сильные стороны, которые можно развивать дальше.",
    strengths: ["Потенциал роста", "Открытость к развитию", "Базовое понимание принципов"],
    risks: ["Неравномерное развитие навыков", "Недостаток фокуса", "Потребность в структуре"],
    developmentSteps: [
      "Определите приоритетную область развития",
      "Изучайте лучшие практики",
      "Ищите обратную связь от коллег",
    ],
  }
}
