---
name: toeic-exam-engine
description: >-
  Use this skill when implementing, modifying, or testing TOEIC exam logic, including question structure for Parts 1-7, ETS scaled score conversion tables, timer countdowns, answer submission grading, and practice modes.
---

# TOEIC Exam Engine & Scoring Workflow

This skill guides the implementation of the core TOEIC test-taking engine, including question partitioning, scoring algorithms, and client-side exam sessions.

---

## 1. TOEIC Test Format & Structure

The standard ETS TOEIC format contains 200 questions across 7 parts (120 minutes total):

### Section 1: Listening Comprehension (100 questions - 45 mins)
- **Part 1 (Photographs)**: 6 questions (Questions 1–6). 1 image per question + 4 audio options (A, B, C, D).
- **Part 2 (Question-Response)**: 25 questions (Questions 7–31). 1 spoken question + 3 audio responses (A, B, C). No printed question text.
- **Part 3 (Short Conversations)**: 39 questions (Questions 32–70). 13 conversations with 3 questions each.
- **Part 4 (Short Talks)**: 30 questions (Questions 71–100). 10 talks with 3 questions each.

### Section 2: Reading Comprehension (100 questions - 75 mins)
- **Part 5 (Incomplete Sentences)**: 30 questions (Questions 101–130). Single sentence grammar/vocabulary fill-in-the-blank (A, B, C, D).
- **Part 6 (Text Completion)**: 16 questions (Questions 131–146). 4 passages, each with 4 blanks.
- **Part 7 (Reading Comprehension)**: 54 questions (Questions 147–200).
  - Single Passages: Questions 147–175 (29 questions).
  - Double Passages: Questions 176–185 (10 questions).
  - Triple Passages: Questions 186–200 (15 questions).

---

## 2. ETS Score Conversion Logic

TOEIC scores are **NOT linear** (each question is NOT 4.95 points). Both Listening and Reading range from **5 to 495** points in increments of 5.

```typescript
export interface ScaledScoreResult {
  listeningRaw: number;
  readingRaw: number;
  listeningScore: number;
  readingScore: number;
  totalScore: number;
}

// Bảng ánh xạ điểm thô (Raw Score: 0-100) sang điểm ETS Scaled Score (5-495)
export function convertRawToScaleScore(listeningRaw: number, readingRaw: number): ScaledScoreResult {
  // Chuẩn hóa input 0 <= raw <= 100
  const lRaw = Math.max(0, Math.min(100, listeningRaw));
  const rRaw = Math.max(0, Math.min(100, readingRaw));

  // Tra cứu bảng quy đổi chuẩn ETS hoặc công cụ tính điểm phi tuyến tính
  const listeningScore = calculateScaledScore(lRaw, 'LISTENING');
  const readingScore = calculateScaledScore(rRaw, 'READING');

  return {
    listeningRaw: lRaw,
    readingRaw: rRaw,
    listeningScore,
    readingScore,
    totalScore: listeningScore + readingScore,
  };
}
```

---

## 3. Client-Side Exam Runner State (Zustand)

The test taker UI must maintain resilient state:
- `answers`: Map of `questionId` -> `{ optionKey: 'A'|'B'|'C'|'D', timeSpent: number }`.
- `flaggedQuestions`: Set of `questionId` marked for review.
- `timeLeft`: Countdown timer in seconds (auto-submits at 0).
- `currentQuestionIndex`: 0 to 199.
- **Auto-save strategy**: On every answer selection, persist immediately to `localStorage` key `exam_session_${examId}` to prevent loss on network drop.
