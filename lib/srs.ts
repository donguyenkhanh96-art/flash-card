type Sm2Input = {
  grade: 1 | 2 | 3 | 4;
  interval: number;
  easeFactor: number;
  repetitions: number;
};

type Sm2Result = {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: Date;
};

const MIN_EASE_FACTOR = 1.3;

function gradeToQuality(grade: 1 | 2 | 3 | 4): number {
  // Map MVP grades to classic SM-2 quality range (0-5).
  return grade + 1;
}

export function calculateSm2(input: Sm2Input): Sm2Result {
  const now = new Date();
  const quality = gradeToQuality(input.grade);

  let { interval, easeFactor, repetitions } = input;

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  if (input.grade < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.max(1, Math.round(interval * easeFactor));
    }
    repetitions += 1;
  }

  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    interval,
    easeFactor,
    repetitions,
    nextReviewDate,
  };
}

export function xpForGrade(grade: 1 | 2 | 3 | 4): number {
  const xpMap: Record<1 | 2 | 3 | 4, number> = {
    1: 1,
    2: 3,
    3: 5,
    4: 8,
  };

  return xpMap[grade];
}
